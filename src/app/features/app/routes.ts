import { Routes } from '@angular/router';
import { DonateComponent } from './components/donate/donate.component';
import { HomeComponent } from './components/home/home.component';

export const routes: Routes = [
  { path: 'donate', component: DonateComponent },
  { path: '**', component: HomeComponent },
];

