import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleComponent } from "./components/module/module.component";
import { ModuleFinishComponent } from "./components/module-finish/module-finish.component";
import { TaskTrainingComponent } from "./components/task-training/task-training.component";
import { TaskResovler } from "./guards/task.resolver";
import { TaskGuard } from "./guards/task.guard";
import { ModuleFinishedGuard } from "./guards/module-fnished.guard";
import { ModuleResovler } from "./guards/module.resolver";

export const routes: Routes = [

  { 
    path: ':moduleId',
    component: ModuleComponent,
    resolve: { _: ModuleResovler},

    children: [
      {
        path: '',
        redirectTo: 'task/',
        pathMatch: 'full',
      },

      {
        path: 'task',
        redirectTo: 'task/',
        pathMatch: 'full',
      },

      { 
        path: 'task/:taskId',
        component: TaskTrainingComponent,
        canActivate:[AuthGuard, TaskGuard],
        resolve: { _: TaskResovler},
        data: { permissions: ['task_submit'] }
      },

      { 
        path: 'end',
        component: ModuleFinishComponent,
        canActivate:[AuthGuard, ModuleFinishedGuard],
        data: { permissions: ['task_submit'] }
      },
    ]
  },

];
