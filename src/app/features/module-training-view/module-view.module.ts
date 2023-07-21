import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleComponent } from "./components/module/module.component";
import { ModuleViewComponent } from "./components/module-view/module-view.component";
import { ModuleViewPlaceholderComponent } from "./components/module-view-placeholder/module-view-placeholder.component";
import { routes } from "./routes";
import { ModuleTrainingCommonModule } from "../module-training-common/module-training-common.module";

@NgModule({
  declarations: [
    ModuleComponent,
    ModuleViewComponent,
    ModuleViewPlaceholderComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    ModuleTrainingCommonModule,
  ],
  providers: [],
})
export class ModuleViewModule { }
