import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export enum TaskSubmitResultDialogSelection {
  RetryTask,
  NextTask,
  NextModule,
  ToExlore
}

export enum TaskSubmitResultType {
  TaskAccepted,
  TaskRejected,
  ModuleFinished
}

export interface TaskSubmitResultDialogModel {
  type: TaskSubmitResultType;
  nextModuleId: number | null;
}

@Component({
  selector: 'task-submit-result-dialog',
  templateUrl: './task-submit-result-dialog.component.html',
  styleUrls: ['./task-submit-result-dialog.component.scss']
})
export class TaskSubmitResultDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskSubmitResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskSubmitResultDialogModel) { }

  get isAccepted(): boolean {
    return this.data.type === TaskSubmitResultType.TaskAccepted;
  } 

  get isRejected(): boolean {
    return this.data.type === TaskSubmitResultType.TaskRejected;
  } 

  get isModuleFinished(): boolean {
    return this.data.type === TaskSubmitResultType.ModuleFinished;
  } 

  retryTask() {
    this.dialogRef.close(TaskSubmitResultDialogSelection.RetryTask);
  }

  nextTask() {
    this.dialogRef.close(TaskSubmitResultDialogSelection.NextTask);
  }

  nextModule() {
    this.dialogRef.close(TaskSubmitResultDialogSelection.NextModule);
  }

  toExplore() {
    this.dialogRef.close(TaskSubmitResultDialogSelection.ToExlore);
  }
}
