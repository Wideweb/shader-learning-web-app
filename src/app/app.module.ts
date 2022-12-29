import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlSceneComponent } from './components/gl-scene/gl-scene.component';
import { TaskComponent } from './components/task/task.component';
import { TaskTrainingComponent } from './components/task-training/task-training.component';
import { TaskResultComponent } from './components/task-result/task-result.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TaskSubmitDialogComponent } from './components/task-submit-dialog/task-submit-dialog.component';
import { TaskSubmitResultDialogComponent } from './components/task-submit-result-dialog/task-submit-result-dialog.component';
import { SignUpComponent } from './components/sign-up/sign-up.component';
import { LoginComponent } from './components/login/login.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SpinnerInterceptor } from './interceptors/spinner.interceptor';
import { TrainingProgressComponent } from './components/progress/training-progress.component';
import { UserTaskResultStatusPipe } from './components/progress/user-task-result-status.pipe';
import { TaskCreateComponent } from './components/task-create/task-create.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { UserRankedListComponent } from './components/user-ranked-list/user-ranked-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { AppInitService } from './services/app-init.service';
import { Observable } from 'rxjs';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ModuleListComponent } from './components/module-list/module-list.component';
import { ModuleComponent } from './components/module/module.component';
import { ModuleCreateComponent } from './components/module-create/module-create.component';
import { ModuleViewComponent } from './components/module-view/module-view.component';
import { ModuleViewTaskTableComponent } from './components/module-view/task-table/task-table.component';
import { ModuleEditComponent } from './components/module-edit/module-edit.component';
import { ModuleEditTaskTableComponent } from './components/module-edit/task-table/task-table.component';
import { ModuleTrainingComponent } from './components/module-training/module-training.component';

export function initializeAppFactory(appInitService: AppInitService) {
  return (): Observable<any> => {
    return appInitService.init();
  }
}

@NgModule({
  declarations: [
    AppComponent,
    GlSceneComponent,
    TaskComponent,
    TaskResultComponent,
    TaskTrainingComponent,
    HomeComponent,
    TaskSubmitDialogComponent,
    TaskSubmitResultDialogComponent,
    SignUpComponent,
    LoginComponent,
    TrainingProgressComponent,
    UserTaskResultStatusPipe,
    TaskCreateComponent,
    TaskListComponent,
    HasPermissionDirective,
    UserRankedListComponent,
    UserProfileComponent,
    UnauthorizedComponent,
    ModuleListComponent,
    ModuleComponent,
    ModuleCreateComponent,
    ModuleViewComponent,
    ModuleViewTaskTableComponent,
    ModuleEditComponent,
    ModuleEditTaskTableComponent,
    ModuleTrainingComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CodemirrorModule,
    BrowserAnimationsModule,
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
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [AppInitService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: SpinnerInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
