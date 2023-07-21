import { Routes } from "@angular/router";
import { RatingComponent } from "./components/rating/rating.component";
import { UserRatingComponent } from "./components/user-rating/user-rating.component";

export const routes: Routes = [
  { 
    path: '',
    component: RatingComponent,
    data: {hidePageOverflow: true}
  },

  { 
    path: 'user/:userId',
    component: UserRatingComponent,
    data: {hidePageOverflow: true}
  },
];
