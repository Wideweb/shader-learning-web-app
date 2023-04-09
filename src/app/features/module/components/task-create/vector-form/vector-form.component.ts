import { Component, Input } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FLOAT_PATTERN } from 'src/app/features/app/app.constants';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'vector-form',
  templateUrl: './vector-form.component.html',
  styleUrls: ['./vector-form.component.css']
})
export class VectorFormComponent {
  @Input()
  public form!: any;

  public matcher = new MyErrorStateMatcher();

  public static createForm(fb: FormBuilder, x: number = 0, y: number = 0, z: number = 0) {
    return fb.group({
      x: new FormControl(x, [Validators.required, Validators.pattern(FLOAT_PATTERN)]),
      y: new FormControl(y, [Validators.required, Validators.pattern(FLOAT_PATTERN)]),
      z: new FormControl(z, [Validators.required, Validators.pattern(FLOAT_PATTERN)]),
    });
  }
}
