import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleTrainingComponent } from "./components/module-training/module-training.component";
import { ModuleComponent } from "./components/module/module.component";
import { TaskTrainingComponent } from "./components/task-training/task-training.component";

export const routes: Routes = [

  { 
    path: ':moduleId',
    component: ModuleComponent,
    children: [
      { 
        path: 'task',
        pathMatch: 'full',
        redirectTo: 'task/',
      },
      
      { 
        path: 'task/:taskId',
        component: ModuleTrainingComponent,
        canActivate:[AuthGuard],
        data: { permissions: ['task_submit'] }
      },
    ]
  },

];
