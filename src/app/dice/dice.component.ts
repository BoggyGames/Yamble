import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DiceState } from './dice.reducer';
import { submitScore, cheatDie } from './dice.actions';
import { scoreRow } from './dice.reducer';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-dice',
  templateUrl: './dice.component.html',
  imports: [NgIf, NgForOf, AsyncPipe],
  styleUrls: ['./dice.component.css']
})
export class DiceComponent {
  state$: Observable<DiceState>;
  previewScore: number | null = null;

  constructor(private store: Store<{ dice: DiceState }>) {
    this.state$ = store.select('dice');
  }

  onHover(row: string, st: DiceState) {
    const current = st.rolls[st.currentRollIdx];
    this.previewScore = scoreRow(row, current);
  }

  onSubmit(row: string) {
    this.store.dispatch(submitScore({ scoreRow: row }));
  }

  onCheat(rollIndex: number, dieIndex: number, newValue: number) {
    this.store.dispatch(cheatDie({ rollIndex, dieIndex, newValue }));
  }
}