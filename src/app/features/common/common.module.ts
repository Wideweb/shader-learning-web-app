import { ModuleWithProviders, NgModule } from "@angular/core";
import { HttpClientModule } from '@angular/common/http';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule} from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GlSceneComponent } from "./components/gl-scene/gl-scene.component";
import { GlService } from "./services/gl.service";
import { SpinnerService } from "./services/spinner.service";
import { LocalService } from "./services/local-storage.service";
import { CommonModule } from "@angular/common";
import { UserTaskResultStatusPipe } from "./pipes/user-task-result-status.pipe";
import { FileService } from "./services/file.service";
import { CodeEditorComponent } from "./components/code-editor/code-editor.component";
import { CodeEditorLinePromptComponent } from "./components/code-editor/line-prompt/line-prompt.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { AppTooltipComponent } from "./components/tooltip/tooltip.component";
import { AppTooltipRendererDirective } from "./components/tooltip/tooltip-renderer.directive";

@NgModule({
  declarations: [
    GlSceneComponent,
    CodeEditorComponent,
    CodeEditorLinePromptComponent,
    AppTooltipComponent,
    UserTaskResultStatusPipe,
    AppTooltipRendererDirective,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatTabsModule,
    MatCheckboxModule,
    DragDropModule,
    MatSnackBarModule,
    MatTooltipModule,
  ],
  exports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatTabsModule,
    MatCheckboxModule,
    DragDropModule,
    MatSnackBarModule,

    GlSceneComponent,
    CodeEditorComponent,
    AppTooltipRendererDirective,
    UserTaskResultStatusPipe,
  ],
})
export class AppCommonModule {
  static forRoot(): ModuleWithProviders<AppCommonModule> {
    return {
      ngModule: AppCommonModule,
      providers: [
        GlService,
        SpinnerService,
        LocalService,
        FileService,
      ]
    };
  }

  static forChild(): ModuleWithProviders<AppCommonModule> {
    return {
      ngModule: AppCommonModule,
      providers: []
    };
  }
}
