import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModuleService } from 'src/app/services/module.service';
import { ModuleDto } from 'src/app/models/module.model';

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

  constructor(private moduleService: ModuleService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      locked: false,
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['moduleId'];
    if (this.id) {
      this.moduleService.get(this.id).subscribe(module => {
        if (!module) {
          return;
        }

        this.module = module;
        this.form.patchValue({
          name: module.name,
          description: module.description,
          locked: module.locked,
        });
      });
    }
  }

  isNew() {
    return !this.id;
  }

  cancel() {
    this.router.navigate([`module/${this.id}/view`]);
  }

  save() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.form.setErrors({});

    const request = this.isNew() ? this.doCreateRequest() : this.doUpdateRequest();
    request.subscribe({
      error: (e) => {
        this.form.setErrors({[e.error.code]: true})
        if (e.error.code == 'MODULE_NAME_NOT_UNIQUE') {
          this.form.controls['name'].setErrors({'MODULE_NAME_NOT_UNIQUE': true});
        }
      },
      next: (id) => {
        this.router.navigate([`module/${id}/view`]);
      }
    });
  }

  doCreateRequest() {
    return this.moduleService.create({
      name: this.form.value.name,
      description: this.form.value.description,
      locked: this.form.value.locked,
    })
  }

  doUpdateRequest() {
    return this.moduleService.update({
      id: this.module!.id,
      name: this.form.value.name,
      description: this.form.value.description,
      locked: this.form.value.locked,
    })
  }
}
