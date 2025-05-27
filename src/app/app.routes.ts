import { Routes } from '@angular/router';
import { DiceComponent } from './dice/dice.component';
import { HowtoplayComponent } from './howtoplay/howtoplay.component';
import { NotfoundComponent } from './notfound/notfound.component';

export const routes: Routes = [
    { path: '', component: DiceComponent },
    { path: 'about', component: HowtoplayComponent },
    { path: '**', component: NotfoundComponent }
];
