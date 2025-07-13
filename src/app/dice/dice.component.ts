import { Component, OnInit } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { NgIf, NgForOf, AsyncPipe } from '@angular/common';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as DiceActions from './dice.actions';
import { DiceEffects } from './dice.effects';
import { DiceState, scoreRow } from './dice.reducer';

/*
STILL TO-DO:

-footer
-mode choice DONE
-challenges DONE
-ocisti reducer code DONE
-efekti (bolje ne, za telefoni da bude safe)
-prozirne tackice na kockice (molim te)
-profile & auth DONE
-storage DONE
-leaderboards DONE
-badges DONE

*/

@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [NgIf, NgForOf, AsyncPipe],
  templateUrl: './dice.component.html',
  styleUrls: ['./dice.component.css'],
  animations: [
    trigger('menuToggle', [
      transition(':enter', [ style({ transform: 'translate(-50%, -50%) scale(0)' }), animate('150ms ease-out', style({ transform: 'translate(-50%, -50%) scale(1)' })) ]),
      transition(':leave', [ style({ transform: 'translate(-50%, -50%) scale(1)' }), animate('150ms ease-in', style({ transform: 'translate(-50%, -50%) scale(0)' })) ])
    ])
  ]
})
export class DiceComponent implements OnInit {
  state$: Observable<DiceState>;
  selectedDie: number | null = null; //kliknuta kockica :)
  hoveredDie: number | null = null; //turen mis na kockicu :)
  hoveredRow: string | null = null; //turen mis na red :)
  wouldScore: any;
  practiceMode: boolean = false; //nije dozvoljeno da submitujes score sa practice run, samo dailies
  allRows = ['Ones','Twos','Threes','Fours','Fives','Sixes','∑ 1 (+30 if >= 60)','Minimum','Maximum','∑ 2 ((Max-Min)*Ones)','3-of-a-Kind','Straight','Full House','4-of-a-Kind','Yamb','∑ 3', '∑ Total'];
  inputRows = ['Ones','Twos','Threes','Fours','Fives','Sixes','Minimum','Maximum','3-of-a-Kind','Straight','Full House','4-of-a-Kind','Yamb']; //bez sume

  fetchTarget = "";
  fetched: boolean = false;
  selected: boolean = false;

  todaysSeed = 0;
  todaysDate: string = "2025-07-03";
  modeClicked: number = 0;
  todaysMode: number = 1;

  constructor(private store: Store<{ dice: DiceState }>) {
    this.state$ = this.store.pipe(select('dice'));
  }

  ngOnInit(): void {
    this.fetchRolls();

    this.state$.subscribe(state => {
      const isFinalRoll = state.currentRollIdx === 13;
      const isPractice = this.practiceMode;

      if (isFinalRoll) console.log("Ended!");
  
      if (isFinalRoll && !isPractice) {
        this.submitToServer(state);
      }
    });
  }

  submitToServer(state: any) {
    const currentUrl = window.location.href;
      console.log("Submitting...");
    
      let fetchTarget = "";

      if(currentUrl.includes("localhost")) {
        fetchTarget = "http://localhost:3000"
      }
      else {
        fetchTarget = "https://api.boggy.dev";
      }

      //console.log(fetchTarget);
      const token = localStorage.getItem("token");
      if (!token) return;

      fetch(fetchTarget + "/yamble", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(state),
      });
      console.log("Score sent to server!");
  }

  getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  onDieClick(idx: number) {
    this.selectedDie = this.selectedDie === idx ? null : idx;
  }

  onCheat(rollIdx: number, dieIdx: number, val: number) {
    this.store.dispatch(DiceActions.cheatDie({ rollIndex: rollIdx, dieIndex: dieIdx, newValue: val }));
    this.selectedDie = null;
  }

  clipboard(a: any) {
    navigator.clipboard.writeText((this.practiceMode ? "PRACTICE " : this.todaysDate + " ") + (this.modeClicked === 0 ? "DAILY" : "CHALLENGE") + " 🎲 I scored " + a["∑ Total"] + " points at Yamble today - dare to challenge me?\nhttps://www.boggy.dev/yamble/");
  }

  practice() {
    this.practiceMode = true;
    const pick = (1 + this.getRandomInt(7));
    this.todaysMode = pick;
    this.store.dispatch(DiceActions.loadRolls({ seed : this.getRandomInt(12345600), mode : this.modeClicked * pick}));
  }

  previewLine(row: string) {

  }

  async fetchRolls() {
    const currentUrl = window.location.href;
    
    let fetchTarget = "";

    if(currentUrl.includes("localhost")) {
      fetchTarget = "http://localhost:3000"
    }
    else {
      fetchTarget = "https://api.boggy.dev";
    }

    //console.log(fetchTarget);

    const fdata: any = (await fetch(fetchTarget + "/dicerolls", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify(data),
    }));
    const data = await fdata.json();
    //console.log(data);
    this.todaysDate = data.rollDate;
    this.todaysSeed = data.randomSeed;
    this.todaysMode = ((new Date(this.todaysDate + 'T00:00:00Z')).getUTCDay()) + 1;

    this.fetched = true;

  }

  title() {
    if (!this.selected) {
      return "Welcome to Yamble!"
    }
    let challname = "";

    switch(this.todaysMode * this.modeClicked) {
      case 0:
        return "Yamble - " + (this.practiceMode ? "Practice Mode" : this.todaysDate)
      case 1:
        challname = "Yamble or Nothing";
        break;
      case 2:
        challname = "By the Book";
        break;
      case 3:
        challname = "Lambda's Trick";
        break;
      case 4:
        challname = "Pillars of Wisdom";
        break;
      case 5:
        challname = "Cheat Day";
        break;
      case 6:
        challname = "The Floor is Acid";
        break;
      case 7:
        challname = "Fundraiser";
        break;
    }

    return (this.practiceMode ? "Practice - " : "Challenge - ") + challname;
  }

  description() {
    if (!this.selected) {
      return "Select a gamemode to play!"
    }

    let challname = "";

    switch(this.todaysMode * this.modeClicked) {
      case 0:
        return " ";
      case 1:
        challname = "A single submitted 0 sets your TOTAL to 0 permanently!";
        break;
      case 2:
        challname = "Input your rolls ONLY into green rows - else, your TOTAL is 0!";
        break;
      case 3:
        challname = "Sum 2 is SUBTRACTED instead of added to your TOTAL!";
        break;
      case 4:
        challname = "Sum 1 is added to your TOTAL an additional time!";
        break;
      case 5:
        challname = "You start with +3 bonus cheats!";
        break;
      case 6:
        challname = "Inputting rolls into green rows also takes 50 points away from your TOTAL!";
        break;
      case 7:
        challname = "You start with 0 cheats - but earn twice as many cheats from green rows!";
        break;
    }

    return challname;
  }

  startGame(mode: number) {
    this.practiceMode = false;
    this.todaysMode = ((new Date(this.todaysDate + 'T00:00:00Z')).getUTCDay()) + 1;
    this.modeClicked = mode;
    this.selected = true;
    const dateOld = localStorage.getItem((mode === 0 ? "dailyDate" : "challDate"));

    if (!dateOld) this.store.dispatch(DiceActions.loadRolls({ seed: this.todaysSeed, mode: mode * this.todaysMode }));
    else {
      if (dateOld === this.todaysDate) {
        //load your old save data!!
        const stateOld = localStorage.getItem((mode === 0 ? "dailyRound" : "challRound"));
        if (stateOld) {
          this.store.dispatch(DiceActions.loadState({ oldState: JSON.parse(stateOld) }));
        }
      }
      else this.store.dispatch(DiceActions.loadRolls({ seed: this.todaysSeed, mode: mode * this.todaysMode }));
    }
    
  }

  //onHover & onUnhover su deprecated - ce prikazujemo preview za sve kolone, da bi bilo mobile-friendly

  onHover(row: string, used: any) {
    //if(row.startsWith("∑"))
    //  return;
    //if (!(used[row] >= 0)) {
    //  this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
    //  this.hoveredRow = row;
    //}
    //alert(row);
    //this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
  }
  onUnhover(row: string) {
    //if(row.startsWith("∑"))
    //  return;
    //if (this.hoveredRow === row)
    //  this.hoveredRow = null;
    //this.store.dispatch(DiceActions.previewScore({ scoreRow: row }));
  }

  dieEnter(index: number) {
    //potential todo: effect on hover
    this.hoveredDie = index;
  }
  dieLeave(index: number) {
    //potential todo: effect on hover
    if (this.hoveredDie === index)
      this.hoveredDie = null;
  }

  onSubmit(row: string, used: any) {
    if(row.startsWith("∑"))
      return;
    if (!(used[row] >= 0)) {
      //alert("huh?")
      this.store.dispatch(DiceActions.submitScore({ scoreRow: row, practice: this.practiceMode }));
      if (!this.practiceMode) localStorage.setItem((this.modeClicked > 0 ? "challDate" : "dailyDate"), this.todaysDate);
    }
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