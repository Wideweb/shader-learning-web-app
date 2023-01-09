import { Component } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { SignUp } from 'src/app/features/auth/state/auth.actions';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent {
  public form: FormGroup;
  public matcher = new MyErrorStateMatcher();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
    });
  }

  signUp() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.form.setErrors({});

    this.store.dispatch(new SignUp(this.form.value))
    .subscribe({
      error: (e) => {
        if (e.error.code == 'USER_NAME_NOT_UNIQUE') {
          this.form.controls['name'].setErrors({'USER_NAME_NOT_UNIQUE': true});
        }

        if (e.error.code == 'EMAIL_NOT_UNIQUE') {
          this.form.controls['email'].setErrors({'EMAIL_NOT_UNIQUE': true});
        }

        if (e.error.code == 'PASSWORD_NOT_MATCH') {
          this.form.controls['password'].setErrors({'PASSWORD_NOT_MATCH': true});
        }
      },
      complete: () => {
        this.router.navigateByUrl('/module-list');
      }
    });
  }

  toLogIn() {
    const params = this.route.snapshot.params;
    this.router.navigate(['/login', params]);
  }
}
