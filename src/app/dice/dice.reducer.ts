import { createReducer, on } from '@ngrx/store';
import * as DiceActions from './dice.actions';

export interface DiceState {
  rolls: number[][]; //2d matrica - koji roll po redu je šta? 13x6
  currentRollIdx: number; //na koji smo trenutno?
  cheatLeft: number; //kolko ostalo cheats?
  usedRows: Record<string, number>; //pamtimo redom
  preview: number; //trenutni hovered preview, jedno samo treba da pamtimo to stanje jer korisnik ima 1 cursor :)
}

function randomRoll() {
  return Math.floor(Math.random() * 6) + 1;
}

function generateRolls() {
  return Array.from({ length: 13 }, () => [randomRoll(),randomRoll(),randomRoll(),randomRoll(),randomRoll(),randomRoll()]);
}

const defaultRolls = generateRolls(); //ovo će bude loaded sa servera kad nije practice
export const initialState: DiceState = {
  rolls: defaultRolls,
  currentRollIdx: 0,
  cheatLeft: 6,
  usedRows: {},
  preview: 0
};

// Yamb poeni
export function scoreRow(row: string, dice: number[]): number {
  const counts = dice.reduce((acc, d) => { acc[d] = (acc[d]||0) + 1; return acc; }, {} as Record<number,number>);
  switch (row) {
    case 'Ones': case 'Twos': case 'Threes': case 'Fours': case 'Fives': case 'Sixes': {
      const numMap: Record<string,number> = { Ones:1, Twos:2, Threes:3, Fours:4, Fives:5, Sixes:6 };
      const n = numMap[row];

      //alert(row);
      return (Math.min(counts[n], 5) || 0) * n;
    }
    case 'Minimum': //min
      return [...dice].sort((a,b)=>a-b).slice(0,5).reduce((s,v)=>s+v, 0);
    case 'Maximum': //max
      return [...dice].sort((a,b)=>b-a).slice(0,5).reduce((s,v)=>s+v, 0);
    case '3-of-a-Kind': //triling
        const triples = Object.entries(counts)
        .filter(([face, c]) => c >= 3)
        .map(([face]) => +face);
        if (triples.length === 0) return 0;
        const best = Math.max(...triples);
        return best * 3 + 20;
    case '4-of-a-Kind': //poker
        const quads = Object.entries(counts)
        .filter(([face, c]) => c >= 4)
        .map(([face]) => +face);
        if (quads.length === 0) return 0;
        const best2 = Math.max(...quads);
        return best2 * 4 + 40;
    case 'Full House': { //ful
      const trips = Object.entries(counts)
        .filter(([face, c]) => c >= 3)
        .map(([face]) => +face);
      if (!trips.length) return 0;
      const tripleValue = Math.max(...trips);
      const remainingCounts = { ...counts };
      remainingCounts[tripleValue] -= 3;
      const pairs = Object.entries(remainingCounts)
        .filter(([face, c]) => c >= 2)
        .map(([face]) => +face);
      if (!pairs.length) return 0;
      const pairValue = Math.max(...pairs);
      return tripleValue * 3 + pairValue * 2 + 30;
    }
    case 'Straight': { //kenta
      const uniq = Array.from(new Set(dice)).sort((a,b)=>a-b);
      const str = uniq.join('');
      const large = str.includes('12345') || str.includes('23456');
      return large ? 66 : 0;
    }
    case 'Yamb':
        const yambs = Object.entries(counts)
        .filter(([face, c]) => c >= 5)
        .map(([face]) => +face);
        if (yambs.length === 0) return 0;
        const best3 = Math.max(...yambs);
        return best3 * 5 + 50;
    
    default:
      return -1;
  }
}

//Yamb zbirovi tj totals
export function totalsCount(rows: any, type: number): number {
  let set1 = (rows["Ones"] ?? 0) + (rows["Twos"] ?? 0) + (rows["Threes"] ?? 0) + (rows["Fours"] ?? 0) + (rows["Fives"] ?? 0) + (rows["Sixes"] ?? 0);
  if (set1 >= 60)
    set1 += 30;
  const set2 = (rows["Ones"] ?? 0) * ((rows["Maximum"] ?? 0) - (rows["Minimum"] ?? 0));
  const set3 = (rows["3-of-a-Kind"] ?? 0) + (rows["Straight"] ?? 0) + (rows["Full House"] ?? 0) + (rows["4-of-a-Kind"] ?? 0) + (rows["Yamb"] ?? 0)
  switch (type) {
    case 1:
      return (rows["Ones"] >= 0 || rows["Twos"] >= 0 || rows["Threes"] >= 0 || rows["Fours"] >= 0 || rows["Fives"] >= 0 || rows["Sixes"] >= 0) ? set1 : -9999;
    case 2:
      return (rows["Ones"] >= 0 && rows["Minimum"] >= 0 && rows["Maximum"] >= 0) ? set2 : -9999;
    case 3:
      return (rows["3-of-a-Kind"] >= 0 || rows["Straight"] >= 0 || rows["Full House"] >= 0 || rows["4-of-a-Kind"] >= 0 || rows["Yamb"] >= 0) ? set3 : -9999;
    case 0:
      return ((rows["Ones"] >= 0 || rows["Twos"] >= 0 || rows["Threes"] >= 0 || rows["Fours"] >= 0 || rows["Fives"] >= 0 || rows["Sixes"] >= 0) ? set1 : 0) + ((rows["Ones"] >= 0 && rows["Minimum"] >= 0 && rows["Maximum"] >= 0) ? set2 : 0) + ((rows["3-of-a-Kind"] >= 0 || rows["Straight"] >= 0 || rows["Full House"] >= 0 || rows["4-of-a-Kind"] >= 0 || rows["Yamb"] >= 0) ? set3 : 0);
    default:
      return -1;
  }
}

export const diceReducer = createReducer(
  initialState,

  on(DiceActions.cheatDie, (state, { rollIndex, dieIndex, newValue }) => state.cheatLeft == 0 ? ({ //ako nema cheats, vrati isto stanje logicno
    ...state,
    cheatLeft: state.cheatLeft,
    rolls: state.rolls
  }) : ({ //ako ima, zameni mu kockicu ko sto trazi :)
    ...state,
    cheatLeft: state.cheatLeft - 1,
    rolls: state.rolls.map((r, i) =>
      i === rollIndex ? r.map((d,j) => j===dieIndex ? newValue : d) : r
    )
  })),

  on(DiceActions.submitScore, (state, { scoreRow: row, practice: practiceMode }) => {
    const dice = state.rolls[state.currentRollIdx];
    const score = scoreRow(row, dice);
    const newState = {
      ...state,
      usedRows: { ...state.usedRows, [row]: score}
    }
    //alert(score);
    const submit = {
      ...newState,
      usedRows: { ...newState.usedRows, ["∑ 1 (+30 if >= 60)"]: totalsCount(newState.usedRows, 1),  ["∑ 2 ((Max-Min)*Ones)"]: totalsCount(newState.usedRows, 2), ["∑ 3"]: totalsCount(newState.usedRows, 3), ["∑ Total"]: totalsCount(newState.usedRows, 0)},
      currentRollIdx: state.currentRollIdx + 1,
      cheatLeft: state.cheatLeft
    };

    if (submit.currentRollIdx == 13) {
      //submit the score to da leaderboard!! do it!! hurry!!!!! samo sto jos nemamo liderbord (todo :))
    }

    //if(!practiceMode)
    //  localStorage.setItem("dailyRound", JSON.stringify(state));

    return submit;
  }),

  on(DiceActions.reset, (state) => {
    return {
      rolls: generateRolls(),
      preview: 0,
      usedRows: {},
      currentRollIdx: 0,
      cheatLeft: 6
    };
  }),

  on(DiceActions.previewScore, (state, { scoreRow: row }) => {
    const dice = state.rolls[state.currentRollIdx];
    const score = scoreRow(row, dice);
    return {
      ...state,
      preview: score
    };
  })
);