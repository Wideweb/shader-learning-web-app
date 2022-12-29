import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { ModuleCreateComponent } from './components/module-create/module-create.component';
import { ModuleEditComponent } from './components/module-edit/module-edit.component';
import { ModuleListComponent } from './components/module-list/module-list.component';
import { ModuleTrainingComponent } from './components/module-training/module-training.component';
import { ModuleViewComponent } from './components/module-view/module-view.component';
import { ModuleComponent } from './components/module/module.component';
import { TrainingProgressComponent } from './components/progress/training-progress.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { TaskCreateComponent } from './components/task-create/task-create.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserRankedListComponent } from './components/user-ranked-list/user-ranked-list.component';
import { AuthGuard } from './guards/auth.guard';
import { NotAuthGuard } from './guards/not-auth.guard';

const routes: Routes = [
  { path: 'user-profile/:id', component: UserProfileComponent, canActivate:[AuthGuard], data: { permissions: ['view-profile'] } },

  { path: 'users-rating', component: UserRankedListComponent, canActivate:[AuthGuard], data: { permissions: ['users-rating'] } },
  
  { path: 'module-list', component: ModuleListComponent, canActivate:[AuthGuard] },

  { path: 'module-create', component: ModuleCreateComponent, canActivate:[AuthGuard] },

  { path: 'module/:moduleId', component: ModuleComponent, canActivate:[AuthGuard] },

  { path: 'module/:moduleId/view', component: ModuleViewComponent, canActivate:[AuthGuard] },

  { path: 'module/:moduleId/edit', component: ModuleEditComponent, canActivate:[AuthGuard] },

  { path: 'module/:moduleId/edit/profile', component: ModuleCreateComponent, canActivate:[AuthGuard] },
  
  { path: 'module/:moduleId/task-create', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_create'] } },
  
  { path: 'module/:moduleId/task/:taskId/edit', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_edit'] } },
  
  { path: 'module/:moduleId/training', component: ModuleTrainingComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },
  
  { path: 'module/:moduleId/training/:taskId', component: ModuleTrainingComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },

  { path: 'progress', component: TrainingProgressComponent, canActivate:[AuthGuard], data: { permissions: ['task_submit'] } },
  
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
