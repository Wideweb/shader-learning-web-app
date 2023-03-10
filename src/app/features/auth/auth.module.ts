import { ModuleWithProviders, NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AppCommonModule } from "../common/common.module";
import { LoginComponent } from "./components/login/login.component";
import { LogoutComponent } from "./components/logout/logout.component";
import { SignUpComponent } from "./components/sign-up/sign-up.component";
import { UnauthorizedComponent } from "./components/unauthorized/unauthorized.component";
import { HasPermissionDirective } from "./directives/has-permission.directive";
import { NoPermissionDirective } from "./directives/no-permission.directive";
import { AuthGuard } from "./guards/auth.guard";
import { NotAuthGuard } from "./guards/not-auth.guard";
import { AuthService } from "./services/auth.service";
import { AuthState } from "./state/auth.state";

@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    SignUpComponent,
    UnauthorizedComponent,
    HasPermissionDirective,
    NoPermissionDirective,
  ],
  imports: [
    AppCommonModule.forChild(),
    RouterModule,
    NgxsModule.forFeature([AuthState]),
  ],
  exports: [
    HasPermissionDirective,
    NoPermissionDirective
  ],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        AuthService,
        AuthGuard,
        NotAuthGuard,
      ]
    };
  }

  static forChild(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: []
    };
  }
}
