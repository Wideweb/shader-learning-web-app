import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleListComponent } from "./components/module-list/module-list.component";
import { routes } from "./routes";
import { ModuleListService } from "./services/module-list.service";
import { ModuleListState } from "./state/module-list.state";
import { ModuleListCardComponent } from "./components/module-list-card/module-list-card.component";
import { ModuleListCardPlaceholderComponent } from "./components/module-list-card-placeholder/module-list-card-placeholder.component";

@NgModule({
  declarations: [
    ModuleListComponent,
    ModuleListCardComponent,
    ModuleListCardPlaceholderComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([ModuleListState]),
  ],
  providers: [
    ModuleListService,
  ],
  exports: [RouterModule],
})
export class ModuleListModule { }
