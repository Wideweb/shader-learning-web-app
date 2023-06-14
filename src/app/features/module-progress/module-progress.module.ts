import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleTrainingComponent } from "./components/module-training/module-training.component";
import { ModuleNavigationTaskComponent } from "./components/module-navigation/task/task.component";
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
import { ModuleNavigationComponent } from "./components/module-navigation/module-navigation.component";
import { FeedbackComponent } from "./components/feedback-dialog/feedback-dialog.component";
import { TaskSubmissionsComponent } from "./components/task/submissions/submissions.component";

@NgModule({
  declarations: [
    ModuleComponent,

    ModuleNavigationComponent,
    ModuleNavigationTaskComponent,

    ModuleTrainingComponent,
    ModuleViewComponent,
    ModuleViewTaskTableComponent,
    TaskComponent,
    TaskSubmissionsComponent,
    TaskResultComponent,
    TaskSubmitDialogComponent,
    TaskSubmitResultDialogComponent,
    TaskTrainingComponent,
    TaskChannelComponent,

    FeedbackComponent,
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
