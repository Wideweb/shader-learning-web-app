import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleTrainingComponent } from "./components/module-training/module-training.component";
import { ModuleViewComponent } from "./components/module-view/module-view.component";
import { ModuleComponent } from "./components/module/module.component";

export const routes: Routes = [

  {
    path: ':moduleId',
    redirectTo: ':moduleId/view',
    pathMatch: 'full',
  },

  { 
    path: ':moduleId',
    component: ModuleComponent,
    children: [
      { 
        path: 'view',
        component: ModuleViewComponent
      },

      { 
        path: 'training', component: ModuleTrainingComponent,
        canActivate:[AuthGuard],
        data: { permissions: ['task_submit'] }
      },
      
      { 
        path: 'training/:taskId',
        component: ModuleTrainingComponent,
        canActivate:[AuthGuard],
        data: { permissions: ['task_submit'] }
      },
    ]
  },

];
