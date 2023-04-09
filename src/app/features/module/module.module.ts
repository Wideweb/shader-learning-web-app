import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { NgxsModule } from "@ngxs/store";
import { AuthModule } from "../auth/auth.module";
import { AppCommonModule } from "../common/common.module";
import { ModuleCreateComponent } from "./components/module-create/module-create.component";
import { ModuleEditFormComponent } from "./components/module-edit/module-edit-form/module-edit-form.component";
import { ModuleEditComponent } from "./components/module-edit/module-edit.component";
import { ModuleEditTaskTableComponent } from "./components/module-edit/task-table/task-table.component";
import { ModuleComponent } from "./components/module/module.component";
import { CameraFormComponent } from "./components/task-create/camera-form/camera-form.component";
import { SceneObjectFormComponent } from "./components/task-create/scene-object-form/scene-object-form.component";
import { SceneSettingsFormComponent } from "./components/task-create/scene-settings-form/scene-settings-form.component";
import { TaskChannelComponent } from "./components/task-create/task-channel/task-channel.component";
import { TaskCreateFormComponent } from "./components/task-create/task-create-form/task-create-form.component";
import { TaskCreateComponent } from "./components/task-create/task-create.component";
import { VectorFormComponent } from "./components/task-create/vector-form/vector-form.component";
import { routes } from "./routes";
import { ModuleService } from "./services/module.service";
import { TaskService } from "./services/task.service";
import { ModuleState } from "./state/module.state";
import { TaskState } from "./state/task.state";

@NgModule({
  declarations: [
    ModuleCreateComponent,
    ModuleComponent,
    ModuleEditComponent,
    ModuleEditFormComponent,
    ModuleEditTaskTableComponent,
    TaskCreateComponent,
    TaskCreateFormComponent,
    TaskChannelComponent,
    SceneSettingsFormComponent,
    SceneObjectFormComponent,
    CameraFormComponent,
    VectorFormComponent,
  ],
  imports: [
    AppCommonModule.forChild(),
    AuthModule.forChild(),
    RouterModule.forChild(routes),
    NgxsModule.forFeature([ModuleState, TaskState]),
  ],
  providers: [
    ModuleService,
    TaskService,
  ],
})
export class ModuleModule { }
