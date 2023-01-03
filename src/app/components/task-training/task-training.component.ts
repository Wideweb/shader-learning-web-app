import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { TaskSubmit, TaskSubmitResult, UserTask } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/app.constants';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'task-training',
  templateUrl: './task-training.component.html',
  styleUrls: ['./task-training.component.css']
})
export class TaskTrainingComponent implements OnDestroy {
  @Input()
  public userTask: UserTask | null = null;

  @Output()
  public onNext = new EventEmitter<void>();

  @Output()
  public onAccepted = new EventEmitter<void>();

  public userVertexShader: string = DEFAULT_VERTEX_SHADER;

  public userFragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public taskSubmitResult: TaskSubmitResult | null = null;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private auth: AuthService,
    private permissions: PermissionService,
    private taskService: TaskService,
    private dialog: MatDialog,
    private router: Router) { }

  get canEdit(): boolean {
    let isOwner = this.userTask?.task?.createdBy === this.auth.me?.id;
    return (isOwner || this.permissions.hasAll(['task_edit_all'])) && this.permissions.hasAll(['task_edit']);
  }

  submit(taskSubmit: TaskSubmit): void {
    this.taskSubmitResult = null;
    const submitRequiest = this.taskService.submit(taskSubmit, this.userTask?.task!);
    
    const submitDialog = this.dialog
      .open(TaskSubmitDialogComponent, { disableClose: true });

    submitDialog
      .afterClosed()
      .pipe(takeUntil(submitRequiest))
      .subscribe(result => result);

      submitRequiest.subscribe(result => {
        this.taskSubmitResult = result;
        submitDialog.close();
        this.showSubmitResult(result);
        if (result.accepted) {
          this.onAccepted.emit();
        }
      });
  }

  showSubmitResult(taskSubmitResult: TaskSubmitResult) {
    this.dialog
      .open<TaskSubmitResultDialogComponent, TaskSubmitResult, boolean>(TaskSubmitResultDialogComponent, { 
        disableClose: true,
        data: taskSubmitResult
      })
      .afterClosed()
      .subscribe(result => result ? this.onNext.emit() : this.retry());
  }

  retry(): void { }

  edit() {
    this.router.navigate([`module/${this.userTask?.task.moduleId}/task/${this.userTask?.task.id}/edit`]);
  }

  like() {
    const value = !this.userTask!.liked;
    this.taskService.like(this.userTask!.task.id, value)
      .subscribe(r => {
        this.userTask!.task.likes = r.likes;
        this.userTask!.task.dislikes = r.dislikes;

        if (r.updated) {
          this.userTask!.liked = value; 
          this.userTask!.disliked = false; 
        }
      });
  }

  dislike() {
    const value = !this.userTask!.disliked;
    this.taskService.dislike(this.userTask!.task.id, value)
      .subscribe(r => {
        this.userTask!.task.likes = r.likes;
        this.userTask!.task.dislikes = r.dislikes;

        if (r.updated) {
          this.userTask!.liked = false; 
          this.userTask!.disliked = value; 
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
