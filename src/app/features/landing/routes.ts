import { Routes } from "@angular/router";
import { LandingComponent } from "./components/landing/landing.component";
import { NotAuthGuard } from "../auth/guards/not-auth.guard";

export const routes: Routes = [
  {
    path: '**',
    component: LandingComponent,
    canActivate: [NotAuthGuard],
    data: {
      showFooterScrollCtrl: true
    }
  },
];
