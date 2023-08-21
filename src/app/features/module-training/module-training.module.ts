import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleComponent } from "./components/module/module.component";
import { TaskChannelComponent } from "./components/task-channel/task-channel.component";
import { TaskSubmitDialogComponent } from "./components/task-submit-dialog/task-submit-dialog.component";
import { TaskSubmitResultDialogComponent } from "./components/task-submit-result-dialog/task-submit-result-dialog.component";
import { TaskTrainingComponent } from "./components/task-training/task-training.component";
import { TaskComponent } from "./components/task/task.component";
import { routes } from "./routes";
import { FeedbackComponent } from "./components/feedback-dialog/feedback-dialog.component";
import { TaskSubmissionsComponent } from "./components/task/submissions/submissions.component";
import { ModuleTrainingCommonModule } from "../module-training-common/module-training-common.module";
import { LikeDialogComponent } from "./components/like-dialog/like-dialog.component";
import { ModuleFinishComponent } from "./components/module-finish/module-finish.component";
import { TaskResovler } from "./guards/task.resolver";
import { TaskGuard } from "./guards/task.guard";
import { ModuleFinishedGuard } from "./guards/module-fnished.guard";
import { ModuleResovler } from "./guards/module.resolver";
import { TaskAnswerComponent } from "./components/task/answer/answer.component";

@NgModule({
  declarations: [
    ModuleComponent,
    ModuleFinishComponent,
    TaskComponent,
    TaskAnswerComponent,
    TaskSubmissionsComponent,
    TaskSubmitDialogComponent,
    TaskSubmitResultDialogComponent,
    TaskTrainingComponent,
    TaskChannelComponent,
    FeedbackComponent,
    LikeDialogComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    ModuleTrainingCommonModule,
  ],
  providers: [
    ModuleResovler,
    ModuleFinishedGuard,
    TaskGuard,
    TaskResovler,
  ],
})
export class ModuleTrainingModule { }
