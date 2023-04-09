import { Component, Input } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { GlGeometry } from 'src/app/features/common/gl-scene/models';
import { VectorFormComponent } from '../vector-form/vector-form.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'scene-object-form',
  templateUrl: './scene-object-form.component.html',
  styleUrls: ['./scene-object-form.component.css']
})
export class SceneObjectFormComponent {
  @Input()
  public form!: any;

  public matcher = new MyErrorStateMatcher();

  public geometries = [
    { label: 'Plane', value: GlGeometry.Plane },
    { label: 'Triangle', value: GlGeometry.Triangle },
    { label: 'Box', value: GlGeometry.Box },
    { label: 'Sphere', value: GlGeometry.Sphere },
  ]

  public static createForm(fb: FormBuilder) {
    return fb.group({
      position: VectorFormComponent.createForm(fb),
      rotation: VectorFormComponent.createForm(fb),
      scale: VectorFormComponent.createForm(fb, 1, 1, 1),
      geometry: [GlGeometry.Plane, Validators.required],
    });
  }
}
