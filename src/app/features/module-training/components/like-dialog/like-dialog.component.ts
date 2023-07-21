import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'like-dialog',
  templateUrl: './like-dialog.component.html',
  styleUrls: ['./like-dialog.component.scss'],
})
export class LikeDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LikeDialogComponent>) { }

  closeDialog() {
    this.dialogRef.close();
  }
}
