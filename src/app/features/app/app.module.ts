import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { AppInitService } from './services/app-init.service';
import { Observable } from 'rxjs';
import { RouterModule } from '@angular/router';
import { routes } from './routes';
import { AuthModule } from '../auth/auth.module';
import { ModuleModule } from '../module/module.module';
import { ModuleListModule } from '../module-list/module-list.module';
import { ModuleProgressModule } from '../module-progress/module-progress.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { UserRankListModule } from '../user-rank-list/user-rank-list.module';
import { PRODUCTION } from 'src/environments/environment';
import { AuthInterceptor } from '../auth/interceptors/auth.interceptor';
import { ServerErrorInterceptor } from '../common/interceptors/server-error.interceptor';
import { SpinnerInterceptor } from '../common/interceptors/spinner.interceptor';
import { AppComponent } from './components/app/app.component';
import { HomeComponent } from './components/home/home.component';
import { AppCommonModule } from '../common/common.module';

export function initializeAppFactory(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.init();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
  ],
  imports: [
    RouterModule.forRoot(routes),
    NgxsModule.forRoot([], { developmentMode: !PRODUCTION }),
    AuthModule.forRoot(),
    AppCommonModule.forRoot(),
    ModuleModule,
    ModuleListModule,
    ModuleProgressModule,
    UserProfileModule,
    UserRankListModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppInitService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ServerErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
