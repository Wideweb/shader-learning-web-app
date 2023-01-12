import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { UserRankedListComponent } from "./components/user-ranked-list/user-ranked-list.component";

export const routes: Routes = [
  { path: 'users-rating', component: UserRankedListComponent, canActivate:[AuthGuard], data: { permissions: ['users_rating'] } },
];
