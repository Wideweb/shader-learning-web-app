import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { UserRankedListComponent } from "./components/user-ranked-list/user-ranked-list.component";
import { routes } from "./routes";
import { UserRankListService } from "./services/user-rank-list.service";
import { UserRankListState } from "./state/user-rank-list.state";

@NgModule({
  declarations: [
    UserRankedListComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([UserRankListState]),
  ],
  providers: [
    UserRankListService,
  ],
})
export class UserRankListModule { }
