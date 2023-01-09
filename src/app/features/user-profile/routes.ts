import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { UserProgressComponent } from "./components/user-progress/user-progress.component";

export const routes: Routes = [
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate:[AuthGuard] },
  { path: 'user-progress', component: UserProgressComponent, canActivate:[AuthGuard] },
];
