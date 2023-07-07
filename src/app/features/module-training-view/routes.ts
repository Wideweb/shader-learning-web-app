import { Routes } from "@angular/router";
import { ModuleComponent } from "./components/module/module.component";

export const routes: Routes = [

  { 
    path: ':moduleId',
    component: ModuleComponent,
  },

];
