import { Component, Input } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { RGBA_PATTERN } from 'src/app/features/app/app.constants';
import { CameraFormComponent } from '../camera-form/camera-form.component';
import { SceneObjectFormComponent } from '../scene-object-form/scene-object-form.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'scene-settings-form',
  templateUrl: './scene-settings-form.component.html',
  styleUrls: ['./scene-settings-form.component.css']
})
export class SceneSettingsFormComponent {
  @Input()
  public form!: any;

  public matcher = new MyErrorStateMatcher();

  public static createForm(fb: FormBuilder, destroy$: Subject<boolean>) {
    const form = fb.group({
      camera: CameraFormComponent.createForm(fb, destroy$),
      object: SceneObjectFormComponent.createForm(fb),
      backgroundRGBA: new FormControl('FFFFFF', [Validators.required, Validators.pattern(RGBA_PATTERN)]),
      background: new FormControl(),
    });

    form.get('background')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(destroy$),
    ).subscribe(color => {
      form.get('backgroundRGBA')?.setValue(color.toString(16).toUpperCase());
      form.get('backgroundRGBA')?.updateValueAndValidity();
    });

    form.get('backgroundRGBA')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(destroy$),
    ).subscribe(color => {
      const opts = {onlySelf: true, emitEvent: false};

      if (form.get('backgroundRGBA')?.invalid || color == null) {
        form.get('background')?.setValue(0, opts);
      } else {
        form.get('background')?.setValue(parseInt(color, 16), opts);
      }
    });

    return form;
  }
}
