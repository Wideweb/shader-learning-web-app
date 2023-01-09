import { Routes } from "@angular/router";
import { AuthGuard } from "../auth/guards/auth.guard";
import { ModuleListComponent } from "./components/module-list/module-list.component";

export const routes: Routes = [
  { path: 'module-list', component: ModuleListComponent, canActivate:[AuthGuard] },
];
