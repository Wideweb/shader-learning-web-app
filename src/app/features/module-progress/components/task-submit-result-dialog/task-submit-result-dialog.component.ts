import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskSubmitResultDto } from '../../models/task.model';

@Component({
  selector: 'task-submit-result-dialog',
  templateUrl: './task-submit-result-dialog.component.html',
  styleUrls: ['./task-submit-result-dialog.component.css']
})
export class TaskSubmitResultDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskSubmitResultDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskSubmitResultDto) { }

  retry() {
    this.dialogRef.close(false);
  }

  next() {
    this.dialogRef.close(true);
  }
}
