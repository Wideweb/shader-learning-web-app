import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { RatingComponent } from "./components/rating/rating.component";
import { routes } from "./routes";
import { RatingState } from "./state/rating.state";
import { RatingService } from "./services/rating.service";
import { UserRatingComponent } from "./components/user-rating/user-rating.component";
import { UserRatingState } from "./state/user-rating.state";

@NgModule({
  declarations: [
    RatingComponent,
    UserRatingComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([RatingState, UserRatingState]),
  ],
  providers: [
    RatingService,
  ],
})
export class RatingModule { }
