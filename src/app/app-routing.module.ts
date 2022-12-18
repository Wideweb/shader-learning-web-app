import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { TrainingComponent } from './components/training/training.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/not-auth.guard';

const routes: Routes = [
  { path: 'training', component: TrainingComponent, canActivate:[AuthGuard] },
  { path: 'sign-up', component: SignUpComponent, canActivate:[NotAuthGuard] },
  { path: 'login', component: LoginComponent, canActivate:[NotAuthGuard] },
  { path: 'logout', component: LogoutComponent, canActivate:[AuthGuard] },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, NotAuthGuard]
})
export class AppRoutingModule { }
