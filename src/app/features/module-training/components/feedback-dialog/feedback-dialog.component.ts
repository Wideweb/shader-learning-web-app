import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
})
export class FeedbackComponent {

  public form: FormGroup;

  public disabled$: Observable<boolean>;

  public submitClass$: Observable<string>;

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<FeedbackComponent>) {
    this.form = this.fb.group({
      unclearDescription: false,
      strictRuntime: false,
      other: false,
      message: new FormControl('', []),
    });

    this.disabled$ = this.form.valueChanges.pipe(
      startWith(this.form.value),
      map(() => !this.isFormValid())
    );

    this.submitClass$ = this.disabled$.pipe(
      map(disabled => disabled ? 'disabled' : ''),
    )
  }

  cancel() {
    this.dialogRef.close(false);
  }

  submit() {
    if (!this.isFormValid()) {
      return;
    }

    this.dialogRef.close(this.form.value);
  }

  isFormValid() {
    return this.form.value.unclearDescription || this.form.value.strictRuntime || this.form.value.other;
  }
}
