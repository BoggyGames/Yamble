import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceComponent } from './dice/dice.component';
import { NavbarComponent } from "./navbar/navbar.component"
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';

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
export class AppComponent {
  constructor(private meta: Meta) { 
    this.meta.addTags([{ property: 'og:title', content: 'Yamble by Boggy Games' },
    { property: 'og:description', content: 'Compete with others to score well in predetermined Yamb!' },
    { property: 'og:url', content: 'https://www.boggy.dev/yamble/' },
    { property: 'og:image', content: 'https://www.boggy.dev/thumbnails/yamblethumb.png' },
    { name: 'theme-color', content: '#311D4F' }]);
  }
}