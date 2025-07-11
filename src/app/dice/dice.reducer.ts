import { createReducer, on } from '@ngrx/store';
import * as DiceActions from './dice.actions';

export interface DiceState {
  rolls: number[][]; //2d matrica - koji roll po redu je šta? 13x6
  currentRollIdx: number; //na koji smo trenutno?
  cheatLeft: number; //kolko ostalo cheats?
  usedRows: Record<string, number>; //pamtimo redom
  previews: Record<string, number>; //sve linije previewujemo (velika promena da bi bilo korisno mobile userima)
  gamemode: number;
}

function mulberry32(a: number) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function randomRoll(num: number) {
  return Math.floor(num * 6) + 1;
}

function generateRolls(seed: number) {
  const getRand = mulberry32(seed);
  return Array.from({ length: 13 }, () => [randomRoll(getRand()),randomRoll(getRand()),randomRoll(getRand()),randomRoll(getRand()),randomRoll(getRand()),randomRoll(getRand())]);
}

const defaultRolls = generateRolls(123456); //ovo će bude loaded sa servera kad nije practice
export const initialState: DiceState = {
  rolls: defaultRolls,
  currentRollIdx: 0,
  cheatLeft: 4,
  usedRows: {},
  previews: getPreviews(defaultRolls[0]),
  gamemode: 0
};

/*

0 Daily - Nothing

1 Yamble or Nothing - a single 0 sets your total to 0 permanently

2 By the Book - input your scores only into green rows, else total is 0

3 Lambda's Trick - Sum2 is SUBTRACTED instead of added to your total

4 Pillars of Wisdom - Sum1 is added to your total one more time

5 Cheat Day - Start with an additional 3 cheats

6 The Floor Is Acid - Gaining +1 cheats from green rows decreases your total by 50

7 Fundraiser - Start with 0 cheats - green rows add +2 instead of +1

*/

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
export function totalsCount(rows: any, type: number, gamemode: number): number {
  const inputRows = ['Ones','Twos','Threes','Fours','Fives','Sixes','Minimum','Maximum','3-of-a-Kind','Straight','Full House','4-of-a-Kind','Yamb'];

  let greencount = 0;

  const cleanedRows: Record<string, number> = Object.fromEntries(
    Object.entries(rows).filter(([key]) => !key.includes('∑'))
  ) as Record<string, number>;

  for (let i = 0; i < Object.keys(cleanedRows).length; i++) {
    if (Object.keys(cleanedRows)[i] === inputRows[i]) {
      greencount++;
    }
  }

  const hasZero = Object.values(cleanedRows).some(value => value === 0);

  let greenpenalty = (gamemode === 6) ? 50 : 0;

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
      const basevalue = ((rows["Ones"] >= 0 || rows["Twos"] >= 0 || rows["Threes"] >= 0 || rows["Fours"] >= 0 || rows["Fives"] >= 0 || rows["Sixes"] >= 0) ? (gamemode === 4 ? 2*set1 : set1) : 0)
      + ((rows["Ones"] >= 0 && rows["Minimum"] >= 0 && rows["Maximum"] >= 0) ? (gamemode === 3 ? -set2 : set2) : 0)
      + ((rows["3-of-a-Kind"] >= 0 || rows["Straight"] >= 0 || rows["Full House"] >= 0 || rows["4-of-a-Kind"] >= 0 || rows["Yamb"] >= 0) ? set3 : 0);

      return (((gamemode === 2) && (greencount < Object.keys(cleanedRows).length)) || ((gamemode === 1) && hasZero) ? 0 : basevalue - greenpenalty * greencount);
    default:
      return -1;
  }
}

export function getPreviews(dice: number[]) : Record<string, number> {
  let prevs = {};

  const inputRows = ['Ones','Twos','Threes','Fours','Fives','Sixes','Minimum','Maximum','3-of-a-Kind','Straight','Full House','4-of-a-Kind','Yamb']; //bez sume

  inputRows.forEach(function(row) {
    prevs = { ...prevs, [row]: scoreRow(row, dice)};
  });

  return prevs;
}

export const diceReducer = createReducer(
  initialState,

  on(DiceActions.cheatDie, (state, { rollIndex, dieIndex, newValue }) => state.cheatLeft == 0 ? ({ //ako nema cheats, vrati isto stanje logicno
    ...state,
    cheatLeft: state.cheatLeft,
    rolls: state.rolls
  }) : ({ //ako ima, zameni mu kockicu ko sto trazi :) nemoj da smanjujes br cheats ako je kliknuo istu brojku!!!!
    ...state,
    cheatLeft: state.cheatLeft - (state.rolls[rollIndex][dieIndex] == newValue ? 0 : 1),
    previews: getPreviews(state.rolls.map((r, i) =>
    i === rollIndex ? r.map((d,j) => j===dieIndex ? newValue : d) : r
  )[(state.currentRollIdx)%13]),
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
    const inputRows = ['Ones','Twos','Threes','Fours','Fives','Sixes','Minimum','Maximum','3-of-a-Kind','Straight','Full House','4-of-a-Kind','Yamb']; //bez sume
    //alert(score);
    const submit = {
      ...newState,
      usedRows: { ...newState.usedRows, ["∑ 1 (+30 if >= 60)"]: totalsCount(newState.usedRows, 1, state.gamemode),  ["∑ 2 ((Max-Min)*Ones)"]: totalsCount(newState.usedRows, 2, state.gamemode), ["∑ 3"]: totalsCount(newState.usedRows, 3, state.gamemode), ["∑ Total"]: totalsCount(newState.usedRows, 0, state.gamemode)},
      currentRollIdx: state.currentRollIdx + 1,
      cheatLeft: state.cheatLeft + (row === inputRows[state.currentRollIdx] ? (state.gamemode === 7 ? 2 : 1) : 0),
      previews: getPreviews(state.rolls[(state.currentRollIdx+1)%13])
    };

    if (submit.currentRollIdx == 13 && !practiceMode) {
      //submit the score to da leaderboard!! do it!! hurry!!!!! samo sto jos nemamo liderbord (todo :))

      //ukloni ovaj print pre nego da pushujes bilo sta na production lmao
      //console.log(submit);
    }

    //if(!practiceMode)
    //  localStorage.setItem("dailyRound", JSON.stringify(state));

    return submit;
  }),

  on(DiceActions.reset, (state) => {

    const newRolls = generateRolls(123456);

    return {
      rolls: newRolls,
      previews: getPreviews(newRolls[0]),
      usedRows: {},
      currentRollIdx: 0,
      cheatLeft: 4,
      gamemode: 0
    };
  }),

  on(DiceActions.loadRolls, (state, { seed: sd, mode: md }) => {

    const newRolls = generateRolls(sd + ((md === 0) ? 0 : 1));

    return {
      rolls: newRolls,
      previews: getPreviews(newRolls[0]),
      usedRows: {},
      currentRollIdx: 0,
      cheatLeft: (md === 5) ? 7 : ((md === 7) ? 0 : 4),
      gamemode: md
    };
  }),

  on(DiceActions.previewScore, (state, { scoreRow: row }) => {
    const dice = state.rolls[state.currentRollIdx];
    const score = getPreviews(dice);
    return {
      ...state,
      previews: score
    };
  })
);