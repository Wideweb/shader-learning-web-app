import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleListComponent } from "./components/module-list/module-list.component";
import { routes } from "./routes";
import { ModuleListService } from "./services/module-list.service";
import { ModuleListState } from "./state/module-list.state";

@NgModule({
  declarations: [
    ModuleListComponent,
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
