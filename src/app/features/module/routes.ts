import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleCreateComponent } from "./components/module-create/module-create.component";
import { ModuleEditComponent } from "./components/module-edit/module-edit.component";
import { ModuleComponent } from "./components/module/module.component";
import { TaskCreateComponent } from "./components/task-create/task-create.component";

export const routes: Routes = [

  {
    path: '', redirectTo: 'create', pathMatch: 'full'
  },

  {
    path: '',
    children: [
      { path: 'create', component: ModuleCreateComponent, canActivate:[AuthGuard] },

      { 
        path: ':moduleId', component: ModuleComponent, canActivate:[AuthGuard],
        children: [
          { path: 'edit', component: ModuleEditComponent, canActivate:[AuthGuard], data: { permissions: ['task_create'] } },
    
          { path: 'task-create', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_create'] } },
          
          { path: 'task/:taskId/edit', component: TaskCreateComponent, canActivate:[AuthGuard], data: { permissions: ['task_edit'] } },
        ]
      },
    ]
  },

];
