import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceComponent } from './dice/dice.component';
import { NavbarComponent } from "./navbar/navbar.component"
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, DiceComponent, NavbarComponent],
  template: `<app-navbar /><router-outlet />`,
  styles: [`
    :host { display: block; padding: 0; margin: 0; font-family: "Bahnschrift", sans-serif; }
    h3 { margin-bottom: 0; }
  `]
})
export class AppComponent {}