import { Component, OnInit } from '@angular/core';
import { NgIf, NgForOf, AsyncPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [NgIf, NgForOf, AsyncPipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileId = "0";
  username = "loading user..."
  wins = 0;
  badges = "0000000000000000";
  date = "1/1/1970";
  badgeList: any = null;

  loggedInHere = false;

  constructor(private route: ActivatedRoute, private router: Router) {}
  
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.profileId = params.get('id')!;
      console.log('Profile ID:', this.profileId);
      this.fetchProfile();
    });
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

  nameMap(tier: string, location: number) {
    switch(location) {
      case 0:
        return "Developer";
      case 1:
        return "Supporter";
      case 12:
        return "Honorable";
      case 13:
        return "Challenger";
      case 14:
        return "Paragon";
      case 15:
        switch(tier) {
          case "1":
            return "5XP";
          case "2":
            return "25XP";
          case "3":
            return "100XP";
          default:
            return "Huh...?";
        }
      default:
        return "Huh...?";
    }
  }

  descMap(tier: string, location: number) {
    switch(location) {
      case 0:
        return "The developer badge. Sorry, not giving these away!";
      case 1:
        return "Badge awarded to ko-fi supporters. Thank you lots for your donation!";
      case 12:
        return "Badge awarded to those few victorious with an unyielding code of honor.";
      case 13:
        return "Badge awarded personally by Lambda for being 1st on the Challenge leaderboard!";
      case 14:
        return "Badge awarded for being 1st on the Daily leaderboard! Congratulations!";
      case 15:
        switch(tier) {
          case "1":
            return "Badge awarded for 5 Daily or Challenge wins!";
          case "2":
            return "Badge awarded for 25 Daily or Challenge wins!";
          case "3":
            return "Badge awarded for 100 Daily or Challenge wins! Wow!";
          default:
            return "Huh...?";
        }
      default:
        return "Huh...?";
    }
  }

  badgeListGen(badge: string) {
    let list = [];

    //console.log(badge);

    for(let i = 0; i < 16; i++) {
      if(badge[i] != "0") {
        const newLine = { name: this.nameMap(badge[i], i), desc: this.descMap(badge[i], i), label: this.badgeMap(badge[i], i) };
        list.push(newLine);
      }
    }

    return list;
  }

  logout() {
    localStorage.removeItem("token");
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  async fetchProfile() {
    const currentUrl = window.location.href;
    
    let fetchTarget = "";

    if(currentUrl.includes("localhost")) {
      fetchTarget = "http://localhost:3000"
    }
    else {
      fetchTarget = "https://api.boggy.dev";
    }

    //console.log(fetchTarget);

    const fdata: any = (await fetch(fetchTarget + "/profiles/" + this.profileId, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      //body: JSON.stringify({ minus: this.minus, mode: 0 }),
    }));
    const data = await fdata.json();
    //console.log(data);
    this.username = data.username;
    this.wins = data.wins;
    this.date = data.created;
    this.badges = data.badges;
    this.badgeList = this.badgeListGen(this.badges);

    const token = localStorage.getItem("token");
    if (!token) return;

    const fdata2: any = (await fetch(fetchTarget + "/verify", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      //body: JSON.stringify({ minus: this.minus, mode: 0 }),
    }));
    if (fdata2.status > 201) {
      console.log("Whoopsies! ", fdata.status);
      return;
    }
    const data2 = await fdata2.json();
    //console.log(data);
    if (data2.username === this.username) {
      this.loggedInHere = true;
    }
  }
}
