import { createAction, props } from '@ngrx/store';

export const loadRolls = createAction('[Dice] Load Rolls');
export const loadRollsSuccess = createAction(
  '[Dice] Load Rolls Success',
  props<{ rolls: number[][] }>()
);
export const cheatDie = createAction(
  '[Dice] Cheat Die',
  props<{ rollIndex: number; dieIndex: number; newValue: number }>()
);
export const submitScore = createAction(
  '[Dice] Submit Score',
  props<{ scoreRow: string }>()
);