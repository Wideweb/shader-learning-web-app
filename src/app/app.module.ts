import { NgModule } from '@angular/core';
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

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GlSceneComponent } from './components/gl-scene/gl-scene.component';
import { TaskComponent } from './components/task/task.component';
import { TrainingComponent } from './components/training/training.component';
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

@NgModule({
  declarations: [
    AppComponent,
    GlSceneComponent,
    TaskComponent,
    TaskResultComponent,
    TrainingComponent,
    HomeComponent,
    TaskSubmitDialogComponent,
    TaskSubmitResultDialogComponent,
    SignUpComponent,
    LoginComponent,
    TrainingProgressComponent,
    UserTaskResultStatusPipe,
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
  ],
  providers: [
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
