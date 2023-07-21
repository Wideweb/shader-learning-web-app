import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { distinctUntilChanged, map, Observable, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'feedback-dialog',
  templateUrl: './feedback-dialog.component.html',
  styleUrls: ['./feedback-dialog.component.scss'],
})
export class FeedbackComponent implements OnInit, OnDestroy {

  public form: FormGroup;

  public disabled$: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

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
  }

  ngOnInit(): void {
    this.form.get('other')?.valueChanges.pipe(
      startWith(false),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(selected => {
      const messageCtrl = this.form.get('message');
      if (!messageCtrl) {
        return;
      }

      if (selected) {
        messageCtrl.addValidators([Validators.required]);
        messageCtrl.enable();
      } else {
        messageCtrl.clearValidators();
        messageCtrl.disable();
      }
      messageCtrl.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
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
    if (this.form.value.other && !this.form.value.message) {
      return false;
    }

    return this.form.value.unclearDescription || this.form.value.strictRuntime || this.form.value.other;
  }
}
