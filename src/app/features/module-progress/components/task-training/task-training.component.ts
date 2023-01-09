import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { firstValueFrom, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { UserTaskDto } from '../../models/user-task.model';
import { TaskSubmitDto, TaskSubmitResultDto } from '../../models/task.model';
import { ModuleProgressSubmitTask, ModuleProgressToggleTaskDislike, ModuleProgressToggleTaskLike } from '../../state/module-progress.actions';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { ModuleProgressState } from '../../state/module-progress.state';

@Component({
  selector: 'task-training',
  templateUrl: './task-training.component.html',
  styleUrls: ['./task-training.component.css']
})
export class TaskTrainingComponent implements OnDestroy {
  @Input()
  public userTask!: UserTaskDto | null;

  @Input()
  public canEdit!: boolean;

  @Output()
  public onNext = new EventEmitter<void>();

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

  like() {
    this.store.dispatch(new ModuleProgressToggleTaskLike());
  }

  dislike() {
    this.store.dispatch(new ModuleProgressToggleTaskDislike());
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
