import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface AchievementDialogModel {
  id: number;
  name: string;
  message: string;
}

@Component({
  selector: 'achievements-dialog',
  templateUrl: './achievements-dialog.component.html',
  styleUrls: ['./achievements-dialog.component.scss']
})
export class AchievementDialogComponent {
  public ico: string = '';

  constructor(
    public dialogRef: MatDialogRef<AchievementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AchievementDialogModel) {
      this.ico = this.getIco(data.id);
    }

  close() {
    this.dialogRef.close();
  }

  private getIco(id: number): string {
    switch (id) {
      case 1: return 'first_step_to_mastery';
      case 2: return 'daily_coder';
      default: return '';
    }
  }
}
