import { Component } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf, NgForOf, AsyncPipe } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as DiceActions from './dice.actions';
import { DiceState, scoreRow } from './dice.reducer';

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [NgIf, NgForOf, AsyncPipe],
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css'],
  animations: [
    trigger('menuToggle', [
      transition(':enter', [ style({ transform: 'translate(-50%, -50%) scale(0)' }), animate('150ms ease-out', style({ transform: 'translate(-50%, -50%) scale(1)' })) ]),
      transition(':leave', [ animate('150ms ease-in', style({ transform: 'translate(-50%, -50%) scale(0)' })) ])
    ])
  ]
})
export class DiceComponent {
  state$: Observable<DiceState>;
  selectedDie: number | null = null; //kliknuta kockica :)
  hoveredRow: string | null = null; //turen mis na red :)
  wouldScore: any;

  constructor(private store: Store<{ dice: DiceState }>) {
    this.state$ = this.store.pipe(select('dice'));
  }

  onDieClick(idx: number) {
    this.selectedDie = this.selectedDie === idx ? null : idx;
  }

  onCheat(rollIdx: number, dieIdx: number, val: number) {
    this.store.dispatch(DiceActions.cheatDie({ rollIndex: rollIdx, dieIndex: dieIdx, newValue: val }));
    this.selectedDie = null;
  }

  clipboard(a: any) {
    navigator.clipboard.writeText("🎲 I scored " + a["∑ Total"] + " points at Yamble today - dare to challenge me?\nhttps://www.boggy.dev/");
  }

  onHover(row: string, used: any) {
    if(row.startsWith("∑"))
      return;
    if (!(used[row] >= 0)) {
      this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
      this.hoveredRow = row;
    }
    //alert(row);
    //this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
  }
  onUnhover(row: string) {
    //if(row.startsWith("∑"))
    //  return;
    if (this.hoveredRow === row)
      this.hoveredRow = null;
    //this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
  }

  onSubmit(row: string, used: any) {
    if(row.startsWith("∑"))
      return;
    if (!(used[row] >= 0))
      //alert("huh?")
      this.store.dispatch(DiceActions.submitScore({ scoreRow: row }));
    //console.log(used);
  }

  getDotPositions(die: number): { x: number; y: number }[] { //ovo crta svgove
    const mid = 50, off = 25;
    return {
      1: [{ x: mid, y: mid }],
      2: [{ x: mid - off, y: mid - off }, { x: mid + off, y: mid + off }],
      3: [{ x: mid, y: mid }, { x: mid - off, y: mid - off }, { x: mid + off, y: mid + off }],
      4: [{ x: mid - off, y: mid - off }, { x: mid + off, y: mid - off }, { x: mid - off, y: mid + off }, { x: mid + off, y: mid + off }],
      5: [{ x: mid, y: mid }, { x: mid - off, y: mid - off }, { x: mid + off, y: mid - off }, { x: mid - off, y: mid + off }, { x: mid + off, y: mid + off }],
      6: [{ x: mid - off, y: mid - off }, { x: mid + off, y: mid - off }, { x: mid - off, y: mid }, { x: mid + off, y: mid }, { x: mid - off, y: mid + off }, { x: mid + off, y: mid + off }]
    }[die] || [];
  }
}