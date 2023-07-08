import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { filter, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserTaskDto, UserTaskSubmissionDto } from '../../models/user-task.model';
import { TaskFeedbackDto, TaskSubmitDto, TaskSubmitResultDto } from '../../models/task.model';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { FeedbackComponent } from '../feedback-dialog/feedback-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from 'src/app/features/common/components/confirm-dialog/confirm-dialog.component';
import { ModuleProgressState, UserShaderProgram } from 'src/app/features/module-training-common/state/module-training-common.state';
import { ModuleProgressReplaceCode, ModuleProgressResetToDefaultCode, ModuleProgressResetToLastSubmettedCode, ModuleProgressSubmitTask, ModuleProgressToggleTaskDislike, ModuleProgressToggleTaskLike, ModuleProgressUpdateUserProgramCode } from 'src/app/features/module-training-common/state/module-training-common.actions';
import { LikeDialogComponent } from '../like-dialog/like-dialog.component';

@Component({
  selector: 'task-training',
  templateUrl: './task-training.component.html',
  styleUrls: ['./task-training.component.css']
})
export class TaskTrainingComponent implements OnDestroy {
  @Input()
  public userTask!: UserTaskDto | null;

  @Input()
  public submissions!: UserTaskSubmissionDto[];

  @Input()
  public userShaderProgram!: UserShaderProgram;

  @Input()
  public canEdit!: boolean;

  @Input()
  public isFirstTask!: boolean;

  @Input()
  public isNextTaskAvailable!: boolean;

  @Output()
  public onNext = new EventEmitter<void>();

  @Output()
  public onSwitchToNext = new EventEmitter<void>();

  @Output()
  public onSwitchToPrev = new EventEmitter<void>();

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private router: Router) {  }

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
    this.dialog
      .open<TaskSubmitResultDialogComponent, TaskSubmitResultDto, boolean>(TaskSubmitResultDialogComponent, { 
        disableClose: true,
        data: taskSubmitResult
      })
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => result ? this.onNext.emit() : this.retry());
  }

  retry(): void { }

  edit() {
    const task = this.userTask!.task;
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
    if (this.userTask?.disliked)
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

  switchToNextTask() {
    this.onSwitchToNext.emit();
  }

  switchToPrevTask() {
    this.onSwitchToPrev.emit();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
