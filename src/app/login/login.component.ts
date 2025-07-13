import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, NgIf],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loggedIn = false;

  message = "";
  username:string = "";
  password:string = "";

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  async login() {
    if(this.username && this.password) {
      console.log("Attempting to login...")
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
      if (token) return;

      const fdata: any = (await fetch(fetchTarget + "/auth/login", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: this.username, password: this.password }),
      }));
      const data = await fdata.json();
      if ("access_token" in data) {
        console.log("Logging in!");
        localStorage.setItem("token", data.access_token);
        this.router.navigate(['/profile', this.username]).then(() => {
          window.location.reload();
        });
      }
      else {
        this.message = "Wrong username or password.";
      }
    }
    else {
      this.message = "Username/password can't be blank!";
    }
  }

  async register() {
    if(this.username && this.password) {
      const currentUrl = window.location.href;
    
      let fetchTarget = "";

      if(currentUrl.includes("localhost")) {
        fetchTarget = "http://localhost:3000"
      }
      else {
        fetchTarget = "https://api.boggy.dev";
      }

      const fdata: any = (await fetch(fetchTarget + "/profiles", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username: this.username, password: this.password }),
      }));
      const data = await fdata.json();
      if ("statusCode" in data) {
        this.message = data.message;
      }
      else {
        if ("wins" in data) {
          await this.login();
        }
      }

    }
    else {
      this.message = "Username/password can't be blank!";
    }
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
    this.loggedIn = true;
  }
}
