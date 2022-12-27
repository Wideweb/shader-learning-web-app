import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { TrainingProgressComponent } from './components/progress/training-progress.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { TaskCreateComponent } from './components/task-create/task-create.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TrainingComponent } from './components/training/training.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserRankedListComponent } from './components/user-ranked-list/user-ranked-list.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/not-auth.guard';

const routes: Routes = [
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate:[AuthGuard], data: { permissions: ['view-profile'] } },

  { path: 'users-rating', component: UserRankedListComponent, canActivate:[AuthGuard], data: { permissions: ['users-rating'] } },
  
  { path: 'progress', component: TrainingProgressComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },
  
  { path: 'create-task', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_create'] } },
  
  { path: 'create-task/:id', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_edit'] } },
  
  { path: 'task-list', component: TaskListComponent, canActivate:[AuthGuard], data: { permissions: ['task_view_all'] } },
  
  { path: 'training', component: TrainingComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },
  
  { path: 'training/:id', component: TrainingComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },
  
  { path: 'sign-up', component: SignUpComponent, canActivate:[NotAuthGuard] },
  
  { path: 'login', component: LoginComponent, canActivate:[NotAuthGuard] },
  
  { path: 'logout', component: LogoutComponent, canActivate:[AuthGuard] },

  { path: '403', component: UnauthorizedComponent, canActivate:[AuthGuard] },
  
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, NotAuthGuard]
})
export class AppRoutingModule { }
