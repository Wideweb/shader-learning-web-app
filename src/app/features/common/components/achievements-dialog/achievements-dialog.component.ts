import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AchievementDialogModel {
  name: string;
  message: string;
}

@Component({
  selector: 'achievements-dialog',
  templateUrl: './achievements-dialog.component.html',
  styleUrls: ['./achievements-dialog.component.scss']
})
export class AchievementDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AchievementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AchievementDialogModel) { }

  close() {
    this.dialogRef.close();
  }
}
