import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { routes } from "./routes";
import { LandingComponent } from "./components/landing/landing.component";
import { LandingAnimationComponent } from "./components/landing/animation/animation.component";
import { CarouselComponent } from "./components/landing/carousel/carousel.component";
import { CarouselCardComponent } from "./components/landing/carousel/carousel-card/carousel-card.component";
import { FeedbackComponent } from "./components/landing/feedback/feedback.component";
import { FeedbackCardComponent } from "./components/landing/feedback/feedback-card/feedback-card.component";
import { FeedbackState } from "./state/feedback.state";
import { ModulesService } from "./services/modules.service";
import { ModulesState } from "./state/modules.state";
import { LandingContactUsComponent } from "./components/landing/contact-us/contact-us.component";
import { CarouselCardPlaceholderComponent } from "./components/landing/carousel/carousel-card-placeholder/carousel-card-placeholder.component";
import { FeedbackCardPlaceholderComponent } from "./components/landing/feedback/feedback-card-placeholder/feedback-card-placeholder.component";

@NgModule({
  declarations: [
    LandingComponent,
    LandingAnimationComponent,
    LandingAnimationComponent,
    CarouselComponent,
    CarouselCardComponent,
    CarouselCardPlaceholderComponent,
    FeedbackComponent,
    FeedbackCardComponent,
    FeedbackCardPlaceholderComponent,
    LandingContactUsComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([ModulesState, FeedbackState]),
  ],
  providers: [
    ModulesService,
  ],
  exports: [RouterModule],
})
export class LandingModule { }
