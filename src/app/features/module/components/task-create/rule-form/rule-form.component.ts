import { Component, Input } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'rule-form',
  templateUrl: './rule-form.component.html',
  styleUrls: ['./rule-form.component.scss']
})
export class RuleFormComponent {
  @Input()
  public form!: any;

  public matcher = new MyErrorStateMatcher();

  public static createForm(fb: FormBuilder, id: number | null = null, keyword: string = '', message: string = '', severity: number = 0) {
    return fb.group({
      id: new FormControl(id, []),
      keyword: new FormControl(keyword, [Validators.required]),
      message: new FormControl(message, [Validators.required]),
      severity: new FormControl(severity, [Validators.required]),
    });
  }
}
