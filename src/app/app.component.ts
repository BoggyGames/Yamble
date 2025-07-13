import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiceComponent } from './dice/dice.component';
import { NavbarComponent } from "./navbar/navbar.component"
import { FooterComponent } from './footer/footer.component';
import { RouterModule } from '@angular/router';
import { Meta } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, DiceComponent, NavbarComponent, FooterComponent],
  template: `<div class="layout"><app-navbar /><main class="content"><router-outlet></router-outlet></main><app-footer /></div>`,
  styles: [`
  :host {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    font-family: "Bahnschrift", sans-serif;
    margin: 0;
    padding: 0;
  }

  .layout {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

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