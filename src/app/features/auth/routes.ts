import { Routes } from "@angular/router";
import { AuthGuard } from "./guards/auth.guard";
import { LoginComponent } from "./components/login/login.component";
import { LogoutComponent } from "./components/logout/logout.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { NotAuthGuard } from "./guards/not-auth.guard";

export const routes: Routes = [
  { path: 'sign-up', component: SignUpComponent, canActivate:[NotAuthGuard] },
  
  { path: 'login', component: LoginComponent, canActivate:[NotAuthGuard] },
  
  { path: 'logout', component: LogoutComponent, canActivate:[AuthGuard] },

  { path: '403', component: UnauthorizedComponent, canActivate:[AuthGuard] },
];
