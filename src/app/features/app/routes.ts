import { Routes } from '@angular/router';
import { DonateComponent } from './components/donate/donate.component';
import { AppLayoutComponent } from './components/layout/layout.component';
import { routes as userProfileRoutes } from '../user-profile/routes';
import { routes as authRoutes } from '../auth/routes';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [

  ...authRoutes,

  {
    path: 'module-training',
    redirectTo: 'explore',
    pathMatch: 'full',
  },
  
  {
    path: 'module-training',
    loadChildren: () => import('../module-training/module-training.module').then(m => m.ModuleTrainingModule),
  },

  {
    path: '',
    component: AppLayoutComponent,
    children: [
      { 
        path: '', 
        pathMatch: 'full',
        loadChildren: () => import('../landing/landing.module').then(m => m.LandingModule)
      },

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
        path: 'rating',
        loadChildren: () => import('../rating/rating.module').then(m => m.RatingModule)
      },

      {
        path: 'module-view',
        loadChildren: () => import('../module-training-view/module-view.module').then(m => m.ModuleViewModule)
      },

      { path: '**', component: NotFoundComponent },
    ]
  },
];

