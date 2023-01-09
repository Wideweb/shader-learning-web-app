import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { filter, Observable, Subject, takeUntil } from 'rxjs';
import { Login } from 'src/app/features/auth/state/auth.actions';
import { AuthState } from '../../state/auth.state';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnDestroy {
  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });

    this.isAuthenticated$
      .pipe(
        filter(isAuthenticated => isAuthenticated),
        takeUntil(this.destroy$),
      )
      .subscribe(() => this.navigate())
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  login() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.form.setErrors(null);

    this.store.dispatch(new Login(this.form.value))
      .pipe()
      .subscribe({
        error: (e) => {
          if (e.error.code == 'USER_NAME_NOT_FOUND') {
            this.form.controls['name'].setErrors({'USER_NAME_NOT_FOUND': true});
          }

          if (e.error.code == 'PASSWORD_NOT_MATCH') {
            this.form.controls['password'].setErrors({'PASSWORD_NOT_MATCH': true});
          }
        },
        complete: () => this.navigate(),
      });
  }

  toSignUp() {
    const params = this.route.snapshot.params;
    this.router.navigate(['/sign-up', params]);
  }

  navigate() {
    const returnUrl = this.route.snapshot.params['returnUrl'];
    this.router.navigate([returnUrl || '/module-list']);
  }
}
