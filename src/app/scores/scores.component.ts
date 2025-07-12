import { Component, OnInit } from '@angular/core';
import { NgForOf, AsyncPipe } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-scores',
  imports: [NgForOf, AsyncPipe, RouterLink, RouterOutlet],
  templateUrl: './scores.component.html',
  styleUrl: './scores.component.css'
})
export class ScoresComponent implements OnInit {
  dailyRows : any = null;
  challRows : any = null;

  minus = 0;

  ngOnInit(): void {
    this.fetchScores();
  }

  badgeMap(tier: string, location: number) {
    switch(location) {
      case 0:
        return "badge-dev";
      case 1:
        return "badge-sup";
      case 12:
        return "badge-cht";
      case 13:
        return "badge-lam";
      case 14:
        return "badge-win";
      case 15:
        switch(tier) {
          case "1":
            return "badge-005";
          case "2":
            return "badge-025";
          case "3":
            return "badge-100";
          default:
            return "badge-cht";
        }
      default:
        return "badge-cht";
    }
  }

  badgeListGen(badge: string) {
    let list = [];

    //console.log(badge);

    for(let i = 0; i < 16; i++) {
      if(badge[i] != "0") {
        const newLine = this.badgeMap(badge[i], i);
        list.push(newLine);
      }
    }

    return list;
  }

  async plusIt() {
    if (this.minus === 0) return;
    this.minus--;
    await this.fetchScores();
  }

  async minusIt() {
    this.minus++;
    await this.fetchScores();
  }

  async fetchScores() {
    this.dailyRows = null;
    this.challRows = null;

    const currentUrl = window.location.href;
    
    let fetchTarget = "";

    if(currentUrl.includes("localhost")) {
      fetchTarget = "http://localhost:3000"
    }
    else {
      fetchTarget = "https://api.boggy.dev";
    }

    //console.log(fetchTarget);

    const fdata: any = (await fetch(fetchTarget + "/highscores?minus=" + this.minus.toString() + "&mode=0", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ minus: this.minus, mode: 0 }),
    }));
    const data = await fdata.json();
    //console.log(data);
    this.dailyRows = data;

    const cdata: any = (await fetch(fetchTarget + "/highscores?minus=" + this.minus.toString() + "&mode=1", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ minus: this.minus, mode: 1 }),
    }));
    const data2 = await cdata.json();
    //console.log(data);
    this.challRows = data2;

  }
}
