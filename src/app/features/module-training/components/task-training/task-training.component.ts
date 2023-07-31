import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { combineLatest, filter, firstValueFrom, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { TaskSubmitResultDialogComponent, TaskSubmitResultDialogModel, TaskSubmitResultDialogSelection, TaskSubmitResultType } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { FeedbackComponent } from '../feedback-dialog/feedback-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/features/common/components/confirm-dialog/confirm-dialog.component';
import { ModuleProgressState, UserShaderProgram } from 'src/app/features/module-training-common/state/module-training-common.state';
import { 
  ModuleProgressLoadNextTask,
  ModuleProgressReplaceCode,
  ModuleProgressResetToDefaultCode,
  ModuleProgressResetToLastSubmettedCode,
  ModuleProgressSubmitTask,
  ModuleProgressToggleTaskDislike,
  ModuleProgressToggleTaskLike,
  ModuleProgressUpdateUserProgramCode,
  ModuleProgressSwitchToNextTask,
  ModuleProgressSwitchToPrevTask,
} from 'src/app/features/module-training-common/state/module-training-common.actions';
import { LikeDialogComponent } from '../like-dialog/like-dialog.component';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { UserTaskDto, UserTaskSubmissionDto } from 'src/app/features/module-training-common/models/user-task.model';
import { TaskDto, TaskFeedbackDto, TaskSubmitDto, TaskSubmitResultDto } from 'src/app/features/module-training-common/models/task.model';

@Component({
  selector: 'task-training',
  templateUrl: './task-training.component.html',
  styleUrls: ['./task-training.component.scss']
})
export class TaskTrainingComponent implements OnInit, OnDestroy {
  @Select(ModuleProgressState.moduleName)
  public moduleName$!: Observable<string>;

  @Select(ModuleProgressState.userTask)
  public userTask$!: Observable<UserTaskDto>;

  @Select(ModuleProgressState.userTaskLiked)
  public liked$!: Observable<boolean>;

  @Select(ModuleProgressState.userTaskDisliked)
  public disliked$!: Observable<boolean>;

  @Select(ModuleProgressState.task)
  public task$!: Observable<TaskDto>;

  @Select(ModuleProgressState.userTaskSubmissions)
  public submissions$!: Observable<UserTaskSubmissionDto[]>;

  @Select(ModuleProgressState.userShaderProgram)
  public userShaderProgram$!: Observable<UserShaderProgram>;

  @Select(ModuleProgressState.isFirstTask)
  public isFirstTask$!: Observable<boolean>;

  @Select(ModuleProgressState.isNextTaskAvailable)
  public isNextTaskAvailable$!: Observable<boolean>;

  @Select(ModuleProgressState.userTaskLoaded)
  public loaded$!: Observable<boolean>;

  public canEdit$: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private router: Router,
    private pageMeta: PageMetaService,
    ) {

    const hasEditTaskPermission$ = this.store.select(AuthState.hasAllPermissions(['task_edit']));
    const hasEditAllTasksPermission$ = this.store.select(AuthState.hasAllPermissions(['task_edit_all']));

    const isOwner$ = combineLatest([this.store.select(AuthState.user), this.userTask$])
      .pipe(
        map(([user, userTask]) => user?.id == userTask?.task?.createdBy?.id)
      );

    this.canEdit$ = combineLatest([isOwner$, hasEditTaskPermission$, hasEditAllTasksPermission$])
      .pipe(
        map(([isOwner, canEdit, canEditAllTasks]) => (isOwner && canEdit) || canEditAllTasks),
        startWith(false)
      );

      combineLatest([this.moduleName$, this.userTask$])
      .pipe(
        filter(([moduleName, userTask]) => !!moduleName && !!userTask),
        takeUntil(this.destroy$),
      )
      .subscribe(([moduleName, userTask]) => this.pageMeta.setTitle(`${moduleName} | ${userTask.task.name}`));
  }

  ngOnInit(): void { }

  async submit(taskSubmit: TaskSubmitDto): Promise<void> {
    const submitDialog = this.dialog.open(TaskSubmitDialogComponent, { disableClose: true });
    await firstValueFrom(this.store.dispatch(new ModuleProgressSubmitTask(taskSubmit)));
    const result = this.store.selectSnapshot(ModuleProgressState.taskSubmitResult);
    submitDialog.close();

    if (result) {
      this.showSubmitResult(result);
    }
  }

  showSubmitResult(taskSubmitResult: TaskSubmitResultDto) {
    const isLastTask = this.store.selectSnapshot(ModuleProgressState.isLastTask);

    let type = TaskSubmitResultType.TaskAccepted;

    if (taskSubmitResult.accepted && taskSubmitResult.moduleFinished && taskSubmitResult.statusChanged) {
      type = TaskSubmitResultType.ModuleFinished;
    } else if (taskSubmitResult.accepted && taskSubmitResult.moduleFinished && isLastTask) {
      type = TaskSubmitResultType.ModuleFinished;
    } else if (!taskSubmitResult.accepted) {
      type = TaskSubmitResultType.TaskRejected;
    }

    this.dialog
      .open<TaskSubmitResultDialogComponent, TaskSubmitResultDialogModel, TaskSubmitResultDialogSelection>(TaskSubmitResultDialogComponent, { 
        disableClose: true,
        data: {
          type,
          nextModuleId: taskSubmitResult.nextModuleId
        }
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result == TaskSubmitResultDialogSelection.RetryTask) {
          this.retry();
        }

        if (result == TaskSubmitResultDialogSelection.NextTask) {
          this.next();
        }

        if (result == TaskSubmitResultDialogSelection.NextModule) {
          this.router.navigate([`/module-view/${taskSubmitResult.nextModuleId}`]);
        }

        if (result == TaskSubmitResultDialogSelection.ToExlore) {
          this.router.navigate([`/explore`]);
        }
      });
  }

  edit() {
    const task = this.store.selectSnapshot(ModuleProgressState.userTask)?.task;
    if (!task) {
      return;
    }

    this.router.navigate([`module/${task.moduleId}/task/${task.id}/edit`]);
  }

  async like() {
    await firstValueFrom(this.store.dispatch(new ModuleProgressToggleTaskLike()));
    if (this.store.selectSnapshot(ModuleProgressState.userTask)?.liked) {
      this.dialog.open<LikeDialogComponent>(LikeDialogComponent, { disableClose: false })
    }
  }

  dislike() {
    const userTask = this.store.selectSnapshot(ModuleProgressState.userTask);
    if (userTask?.disliked)
    {
      this.store.dispatch(new ModuleProgressToggleTaskDislike());
      return;
    }

    this.dialog
      .open<FeedbackComponent, any, TaskFeedbackDto | null>(FeedbackComponent, { disableClose: false })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        takeUntil(this.destroy$)
      )
      .subscribe(feedback => this.store.dispatch(new ModuleProgressToggleTaskDislike(feedback)));
  }

  handleFragmentCodeChange(program: {vertex: string, fragment: string}) {
    this.store.dispatch(new ModuleProgressUpdateUserProgramCode(program.vertex, program.fragment));
  }

  resetToLastSubmettedCode() {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        disableClose: false,
        data: {
          title: 'Return last submit',
          message: `Your code will be discarded and replaced with your last submission's code`,
        },
        backdropClass: 'backdropBackground'
      })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        takeUntil(this.destroy$)
      )
      .subscribe(_ => this.store.dispatch(new ModuleProgressResetToLastSubmettedCode()));
  }

  resetToDefaultCode() {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        disableClose: false,
        data: {
          title: 'Reset to default code definition',
          message: `Your current code will be discarded and reset to the default code`,
        },
        backdropClass: 'backdropBackground'
      })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        takeUntil(this.destroy$)
      )
      .subscribe(_ => this.store.dispatch(new ModuleProgressResetToDefaultCode()));
  }

  selectSubmission(submission: UserTaskSubmissionDto) {
    this.dialog
      .open<ConfirmDialogComponent, ConfirmDialogData, boolean>(ConfirmDialogComponent, {
        disableClose: false,
        data: {
          title: `Are you sure?`,
          message: `Your current code will be discarded and replaced with the selected submission's code!`,
        },
      })
      .afterClosed()
      .pipe(
        filter(result => !!result),
        takeUntil(this.destroy$)
      )
      .subscribe(_ => this.store.dispatch(new ModuleProgressReplaceCode(submission.vertexShader, submission.fragmentShader)));
  }

  next(): void {
    // const module = this.store.selectSnapshot(ModuleProgressState.module);
    // const finished = this.store.selectSnapshot(ModuleProgressState.finished);
    // if (finished) {
    //   // this.router.navigate([`module-training/${module!.id}/end`]);
    //   this.router.navigate([`module-view/${module!.id}`]);
    // } else {
      this.store.dispatch(new ModuleProgressLoadNextTask());
    // }
  }

  retry(): void { }

  switchToNext(): void {
    this.store.dispatch(new ModuleProgressSwitchToNextTask());
  }

  switchToPrev(): void {
    this.store.dispatch(new ModuleProgressSwitchToPrevTask());
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
