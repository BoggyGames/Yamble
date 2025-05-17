import { createReducer, on } from '@ngrx/store';
import * as DiceActions from './dice.actions';

export interface DiceState {
  rolls: number[][];
  currentRollIdx: number;
  cheatLeft: number;
  usedRows: Record<string, number>;
}

const defaultRolls = Array.from({ length: 13 }, () => [1,2,3,4,5,6]);
export const initialState: DiceState = {
  rolls: defaultRolls,
  currentRollIdx: 0,
  cheatLeft: 6,
  usedRows: {}
};

// Yamb poeni
export function scoreRow(row: string, dice: number[]): number {
  const counts = dice.reduce((acc, d) => { acc[d] = (acc[d]||0) + 1; return acc; }, {} as Record<number,number>);
  switch (row) {
    case 'Ones': case 'Twos': case 'Threes': case 'Fours': case 'Fives': case 'Sixes': {
      const numMap: Record<string,number> = { ones:1, twos:2, threes:3, fours:4, fives:5, sixes:6 };
      const n = numMap[row];
      return (counts[n] || 0) * n;
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
        .filter(([face, c]) => c >= 3)
        .map(([face]) => +face);
        if (quads.length === 0) return 0;
        const best2 = Math.max(...quads);
        return best2 * 4 + 40;
    case 'Full House': { //ful
      const values = Object.values(counts);
      const has3 = values.includes(3);
      const has2 = values.includes(2);
      return (has3 && has2) ? 50 : 0;
    }
    case 'Straight': { //kenta
      const uniq = Array.from(new Set(dice)).sort((a,b)=>a-b);
      const str = uniq.join('');
      const large = str.includes('12345') || str.includes('23456');
      return large ? 66 : 0;
    }
    case 'Yamb':
        const yambs = Object.entries(counts)
        .filter(([face, c]) => c >= 3)
        .map(([face]) => +face);
        if (yambs.length === 0) return 0;
        const best3 = Math.max(...yambs);
        return best3 * 5 + 50;
    default:
      return -1;
  }
}

export const diceReducer = createReducer(
  initialState,
  on(DiceActions.cheatDie, (state, { rollIndex, dieIndex, newValue }) => ({
    ...state,
    cheatLeft: state.cheatLeft - 1,
    rolls: state.rolls.map((r, i) =>
      i === rollIndex ? r.map((d,j) => j===dieIndex ? newValue : d) : r
    )
  })),
  on(DiceActions.submitScore, (state, { scoreRow: row }) => {
    const dice = state.rolls[state.currentRollIdx];
    const score = scoreRow(row, dice);
    return {
      ...state,
      usedRows: { ...state.usedRows, [row]: score },
      currentRollIdx: state.currentRollIdx + 1,
      cheatLeft: 6
    };
  })
);