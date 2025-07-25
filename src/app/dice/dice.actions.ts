import { createAction, props } from '@ngrx/store';

export const loadRolls = createAction(
  '[Dice] Load Rolls',
  props<{ seed: number, mode: number }>()
);

export const loadState = createAction(
  '[Dice] Load State',
  props<{ oldState: any }>()
);

export const reset = createAction('[Dice] Reset');

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
  props<{ scoreRow: string, practice: boolean }>()
);

export const previewScore = createAction(
  '[Dice] Preview Score',
  props<{ scoreRow: string }>()
);
//load rolls - uzmi sa servera šta je bilo, ili ako je practice mode izgeneriši si
//cheat - izmeni kockicu ako imas za menjazu
//submit - stavi trajno u tabelu, uzmi sledeci roll
//preview - samo vidi u red kolko bi to poena bilo