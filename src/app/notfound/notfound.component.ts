import { Component } from '@angular/core';

@Component({
  selector: 'app-notfound',
  imports: [],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css'
})
export class NotfoundComponent {
  randomQuote() : string {
    const num = Math.floor(Math.random() * 8);

    switch(num) {
      case 0:
        return "You a bit lost?";
      case 1:
        return "Having fun there?";
      case 2:
        return "Look what you did!!!";
      case 3:
        return "Huh?";
      case 4:
        return "Pretty sure this isn't supposed to happen.";
      case 5:
        return "Ouch.";
      case 6:
        return "I think this is an error.";
      case 7:
        return "So, this is the power of...";
      default:
        return "HEEEEEELP";
    }
  }
}
