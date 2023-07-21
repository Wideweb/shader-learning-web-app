import { NgModule } from "@angular/core";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleProgressService } from "./services/module-progress.service";
import { UserTaskService } from "./services/user-task.service";
import { ModuleProgressState } from "./state/module-training-common.state";
import { ModuleNavigationComponent } from "./components/module-navigation/module-navigation.component";
import { ModuleNavigationTaskComponent } from "./components/module-navigation/task/task.component";
import { ModuleNavigationPlaceholderComponent } from "./components/module-navigation/placeholder/module-navigation-placeholder.component";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [
    ModuleNavigationComponent,
    ModuleNavigationTaskComponent,
    ModuleNavigationPlaceholderComponent
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    NgxsModule.forFeature([ModuleProgressState]),
    RouterModule.forChild([]),
  ],
  exports: [
    NgxsModule,
    ModuleNavigationComponent,
    ModuleNavigationPlaceholderComponent,
  ],
  providers: [
    ModuleProgressService,
    UserTaskService,
  ],
})
export class ModuleTrainingCommonModule { }
