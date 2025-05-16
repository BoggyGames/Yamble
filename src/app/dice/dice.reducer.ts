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

// Yamb scoring helper
export function scoreRow(row: string, dice: number[]): number {
  const counts = dice.reduce((acc, d) => { acc[d] = (acc[d]||0) + 1; return acc; }, {} as Record<number,number>);
  switch (row) {
    case 'ones': case 'twos': case 'threes': case 'fours': case 'fives': case 'sixes': {
      const numMap: Record<string,number> = { ones:1, twos:2, threes:3, fours:4, fives:5, sixes:6 };
      const n = numMap[row];
      return (counts[n] || 0) * n;
    }
    case 'min':
      return [...dice].sort((a,b)=>a-b).slice(0,5).reduce((s,v)=>s+v, 0);
    case 'max':
      return [...dice].sort((a,b)=>b-a).slice(0,5).reduce((s,v)=>s+v, 0);
    case '3kind':
      return Object.values(counts).some(c=>c>=3) ? dice.reduce((a,b)=>a+b,0) + 20 : 0;
    case '4kind':
      return Object.values(counts).some(c=>c>=4) ? dice.reduce((a,b)=>a+b,0) + 30 : 0;
    case 'full': {
      const values = Object.values(counts);
      const has3 = values.includes(3);
      const has2 = values.includes(2);
      return (has3 && has2) ? 50 : 0;
    }
    case 'straight': {
      const uniq = Array.from(new Set(dice)).sort((a,b)=>a-b);
      const str = uniq.join('');
      const small = str.includes('1234') || str.includes('2345');
      const large = str.includes('12345') || str.includes('23456');
      return large ? 75 : small ? 55 : 0;
    }
    case 'yatzy':
      return Object.values(counts).some(c=>c===5) ? 100 : 0;
    default:
      return 0;
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