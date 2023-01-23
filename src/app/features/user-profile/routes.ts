import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";

export const routes: Routes = [
  { path: 'profile', component: UserProfileComponent, canActivate:[AuthGuard], data: { permissions: ['profile_view'] } },

  { path: 'user-profile/:id', component: UserProfileComponent },
];
