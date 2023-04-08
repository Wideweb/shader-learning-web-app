import { Component, Input } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { FLOAT_PATTERN } from 'src/app/features/app/app.constants';
import { VectorFormComponent } from '../vector-form/vector-form.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'camera-form',
  templateUrl: './camera-form.component.html',
  styleUrls: ['./camera-form.component.css']
})
export class CameraFormComponent {
  @Input()
  public form!: any;

  public matcher = new MyErrorStateMatcher();

  public static createForm(fb: FormBuilder, destroy$: Subject<boolean>) {
    const near = new FormControl(0.1, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);
    const far = new FormControl(100, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);

    const fov = new FormControl(45, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);

    const left = new FormControl(0, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);
    const right = new FormControl(1, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);
    const top = new FormControl(1, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);
    const bottom = new FormControl(0, [Validators.required, Validators.pattern(FLOAT_PATTERN)]);

    const form = fb.group({
      position: VectorFormComponent.createForm(fb),
      rotation: VectorFormComponent.createForm(fb),
      isOrthographic: true,
      near,
      far,

      fov,

      left,
      right,
      top,
      bottom,
    });

    form.get('isOrthographic')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(destroy$),
    ).subscribe(isOrthographic => {
      if (isOrthographic) {
        left.addValidators([Validators.required, Validators.pattern(FLOAT_PATTERN)]);
        right.addValidators([Validators.required, Validators.pattern(FLOAT_PATTERN)]);
        top.addValidators([Validators.required, Validators.pattern(FLOAT_PATTERN)]);
        bottom.addValidators([Validators.required, Validators.pattern(FLOAT_PATTERN)]);

        fov.clearValidators();
        fov.setValue(45);
        fov.updateValueAndValidity();
      } else {
        fov.addValidators([Validators.required, Validators.pattern(FLOAT_PATTERN)]);

        left.clearValidators();
        left.setValue(0);
        left.updateValueAndValidity();
        
        right.clearValidators();
        right.setValue(1);
        right.updateValueAndValidity();

        top.clearValidators();
        top.setValue(1);
        top.updateValueAndValidity();

        bottom.clearValidators();
        bottom.setValue(0);
        bottom.updateValueAndValidity();
      }
    });

    return form;
  }
}
