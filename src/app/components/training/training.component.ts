import { Component, OnDestroy, OnInit } from '@angular/core';
import { TaskSubmit, TaskSubmitResult, UserTask } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { BehaviorSubject, map, Subject, takeUntil } from 'rxjs';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER, ROLE_ADMINISTRATOR } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit, OnDestroy {
  public userTask: UserTask | null = null;

  public userVertexShader: string = DEFAULT_VERTEX_SHADER;

  public userFragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public taskSubmitResult: TaskSubmitResult | null = null;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private auth: AuthService, private permissions: PermissionService, private taskService: TaskService, private dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.next(id);
  }
  
  next(id: number | null = null): void {
    this.loaded$.next(false);
    this.userTask = null;

    const request = id ? this.taskService.getUserTask(id) : this.taskService.getNext();
    request.subscribe(userTask => {
      this.userTask = userTask;
      this.loaded$.next(true);
    });
  }

  public get canEdit(): boolean {
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
      });
  }

  showSubmitResult(taskSubmitResult: TaskSubmitResult) {
    this.dialog
      .open<TaskSubmitResultDialogComponent, TaskSubmitResult, boolean>(TaskSubmitResultDialogComponent, { 
        disableClose: true,
        data: taskSubmitResult
      })
      .afterClosed()
      .subscribe(result => result ? this.next() : this.retry());
  }

  retry(): void { }

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
