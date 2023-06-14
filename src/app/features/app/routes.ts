import { Routes } from '@angular/router';
import { DonateComponent } from './components/donate/donate.component';
import { HomeComponent } from './components/home/home.component';
import { AppLayoutComponent } from './components/layout/layout.component';
import { routes as userProfileRoutes } from '../user-profile/routes';
import { routes as authRoutes } from '../auth/routes';
import { routes as landingRoutes } from '../landing/routes';
import { AboutComponent } from './components/about/about.component';

export const routes: Routes = [

  ...authRoutes,

  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { path: 'donate', component: DonateComponent },

      { path: 'about', component: AboutComponent },

      ...userProfileRoutes,

      {
        path: 'explore',
        loadChildren: () => import('../module-list/module-list.module').then(m => m.ModuleListModule)
      },

      {
        path: 'module',
        loadChildren: () => import('../module/module.module').then(m => m.ModuleModule)
      },

      {
        path: 'module-progress',
        redirectTo: 'explore',
        pathMatch: 'full',
      },

      {
        path: 'module-progress',
        loadChildren: () => import('../module-progress/module-progress.module').then(m => m.ModuleProgressModule),
      },

      {
        path: 'users-rating',
        loadChildren: () => import('../user-rank-list/user-rank-list.module').then(m => m.UserRankListModule)
      },

      { 
        path: 'home', 
        component: HomeComponent 
      },

      { 
        path: '**', 
        loadChildren: () => import('../landing/landing.module').then(m => m.LandingModule)
      },
    ]
  },
];

