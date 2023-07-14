import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgxsModule } from '@ngxs/store';
import { AppInitService } from './services/app-init.service';
import { PreloadAllModules, RouterModule } from '@angular/router';
import { routes } from './routes';
import { AuthModule } from '../auth/auth.module';
import { UserProfileModule } from '../user-profile/user-profile.module';
import { PRODUCTION } from 'src/environments/environment';
import { AuthInterceptor } from '../auth/interceptors/auth.interceptor';
import { ServerErrorInterceptor } from '../common/interceptors/server-error.interceptor';
import { SpinnerInterceptor } from '../common/interceptors/spinner.interceptor';
import { AppComponent } from './components/app/app.component';
import { AppCommonModule } from '../common/common.module';
import { DonateComponent } from './components/donate/donate.component';
import { AppLayoutComponent } from './components/layout/layout.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AboutComponent } from './components/about/about.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

export function initializeAppFactory(appInitService: AppInitService) {
  return (): Promise<any> => {
    return appInitService.init();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    AppLayoutComponent,
    DonateComponent,
    AboutComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(
      routes,
      {
        preloadingStrategy: PreloadAllModules
      }
    ),
    NgxsModule.forRoot([], { developmentMode: !PRODUCTION }),
    AuthModule.forRoot(),
    AppCommonModule.forRoot(),
    UserProfileModule,
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
