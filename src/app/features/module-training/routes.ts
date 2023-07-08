import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleTrainingComponent } from "./components/module-training/module-training.component";
import { ModuleComponent } from "./components/module/module.component";
import { ModuleFinishComponent } from "./components/module-finish/module-finish.component";

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

      { 
        path: 'end',
        component: ModuleFinishComponent,
        canActivate:[AuthGuard],
        data: { permissions: ['task_submit'] }
      },
    ]
  },

];
