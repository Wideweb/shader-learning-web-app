import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { UserProfileComponent } from "./components/user-profile/user-profile.component";
import { UserProgressComponent } from "./components/user-progress/user-progress.component";
import { UserProfileService } from "./services/user-profile.service";
import { UserProfileState } from "./state/user-profile.state";

@NgModule({
  declarations: [
    UserProfileComponent,
    UserProgressComponent
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule,
    NgxsModule.forFeature([UserProfileState]),
  ],
  providers: [
    UserProfileService,
  ],
})
export class UserProfileModule { }
