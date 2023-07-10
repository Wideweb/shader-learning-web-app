import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'task-submit-dialog',
  templateUrl: './task-submit-dialog.component.html',
  styleUrls: ['./task-submit-dialog.component.scss']
})
export class TaskSubmitDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TaskSubmitDialogComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
