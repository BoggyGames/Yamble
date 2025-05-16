import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceComponent } from './dice/dice.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, DiceComponent],
  template: `<app-dice></app-dice>`,
  styles: [`
    :host { display: block; padding: 1rem; font-family: Arial, sans-serif; }
    h3 { margin-bottom: 0.5rem; }
  `]
})
export class AppComponent {}