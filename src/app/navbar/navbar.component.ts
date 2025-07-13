import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterOutlet, CommonModule, NgIf],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  menuOpen = false;
  loggedIn = false;
  username = "";

  ngOnInit(): void {
    this.fetchProfile();
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
    const token = localStorage.getItem("token");
    if (!token) return;

    const fdata: any = (await fetch(fetchTarget + "/verify", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      //body: JSON.stringify({ minus: this.minus, mode: 0 }),
    }));
    if (fdata.status > 201) {
      console.log("Whoopsies! ", fdata.status);
      return;
    }
    const data = await fdata.json();
    //console.log(data);
    this.username = data.username;
    this.loggedIn = true;
  }

}
