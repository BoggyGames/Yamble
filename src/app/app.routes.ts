import { Routes } from '@angular/router';
import { DiceComponent } from './dice/dice.component';
import { HowtoplayComponent } from './howtoplay/howtoplay.component';
import { LoginComponent } from './login/login.component';
import { NotfoundComponent } from './notfound/notfound.component';
import { ProfileComponent } from './profile/profile.component';
import { ScoresComponent } from './scores/scores.component';

export const routes: Routes = [
    { path: '', component: DiceComponent },
    { path: 'about', component: HowtoplayComponent },
    { path: 'scores', component: ScoresComponent },
    { path: 'profile/:id', component: ProfileComponent },
    { path: 'login', component: LoginComponent },
    { path: '**', component: NotfoundComponent }
];
