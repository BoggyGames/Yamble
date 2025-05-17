import { bootstrapApplication } from '@angular/platform-browser';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { diceReducer } from './app/dice/dice.reducer';
import { DiceEffects } from './app/dice/dice.effects';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([]),
    provideStore({ dice: diceReducer }),
    provideEffects([DiceEffects]),
    provideStoreDevtools({ maxAge: 25 }),
    provideAnimations(),
    importProvidersFrom(HttpClientModule)
  ]
}).catch(err => console.error(err));