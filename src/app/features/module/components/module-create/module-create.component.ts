import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleCreate } from '../../state/module.actions';
import { ModuleDto } from '../../models/module.model';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'module-create',
  templateUrl: './module-create.component.html',
  styleUrls: ['./module-create.component.css']
})
export class ModuleCreateComponent implements OnInit {
  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  public id: number = -1;

  public module: ModuleDto | null = null;

  public compiledMarkdown: string = '';

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      locked: false,
    });
  }

  async ngOnInit(): Promise<void> { }

  cancel() {
    this.router.navigate([`module-list`]);
  }

  save() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.form.setErrors({});

    this.store
      .dispatch(new ModuleCreate({
        name: this.form.value.name,
        description: this.form.value.description,
        locked: this.form.value.locked,
      }))
      .subscribe({
        error: (e) => {
          if (e.error.code == 'MODULE_NAME_NOT_UNIQUE') {
            this.form.controls['name'].setErrors({'MODULE_NAME_NOT_UNIQUE': true});
          }
        },
        next: (id) => {
          this.router.navigate([`module/${id}/edit`]);
        }
      });
  }
}
