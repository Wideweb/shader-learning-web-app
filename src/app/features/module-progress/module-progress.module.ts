import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleTrainingComponent } from "./components/module-training/module-training.component";
import { ModuleTrainingNavigationTaskStatusComponent } from "./components/module-training/navigation/task-status/task-status.component";
import { ModuleTrainingNavigationTaskComponent } from "./components/module-training/navigation/task/task.component";
import { ModuleViewComponent } from "./components/module-view/module-view.component";
import { ModuleViewTaskTableComponent } from "./components/module-view/task-table/task-table.component";
import { ModuleComponent } from "./components/module/module.component";
import { TaskChannelComponent } from "./components/task-channel/task-channel.component";
import { TaskResultComponent } from "./components/task-result/task-result.component";
import { TaskSubmitDialogComponent } from "./components/task-submit-dialog/task-submit-dialog.component";
import { TaskSubmitResultDialogComponent } from "./components/task-submit-result-dialog/task-submit-result-dialog.component";
import { TaskTrainingComponent } from "./components/task-training/task-training.component";
import { TaskComponent } from "./components/task/task.component";
import { routes } from "./routes";
import { ModuleProgressService } from "./services/module-progress.service";
import { UserTaskService } from "./services/user-task.service";
import { ModuleProgressState } from "./state/module-progress.state";

@NgModule({
  declarations: [
    ModuleComponent,
    
    ModuleTrainingComponent,
    ModuleTrainingNavigationTaskComponent,
    ModuleTrainingNavigationTaskStatusComponent,

    ModuleViewComponent,
    ModuleViewTaskTableComponent,
    TaskComponent,
    TaskResultComponent,
    TaskSubmitDialogComponent,
    TaskSubmitResultDialogComponent,
    TaskTrainingComponent,
    TaskChannelComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([ModuleProgressState]),
  ],
  providers: [
    ModuleProgressService,
    UserTaskService,
  ],
})
export class ModuleProgressModule { }
