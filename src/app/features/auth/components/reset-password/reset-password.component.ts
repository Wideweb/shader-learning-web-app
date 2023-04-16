import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { BehaviorSubject, Subject } from 'rxjs';
import { ResetPassword } from 'src/app/features/auth/state/auth.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  public isTokenInvalid$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pageMeta: PageMetaService,
  ) {
    this.form = this.fb.group({
      password: new FormControl('', [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.pageMeta.setTitle('Reset Password');
    this.pageMeta.setDescription('Sign in to your account and continue to improve your shading skills by solving interactive problems on Shader Learning.');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  resetPassword() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.form.setErrors(null);

    const userId = Number.parseInt(this.route.snapshot.params['userId']);
    const token = this.route.snapshot.params['token'];
    const password = this.form.value.password;

    this.store.dispatch(new ResetPassword({userId, token, password}))
      .pipe()
      .subscribe({
        error: (e) => {
          if (e.error.code == 'WRONG_PASSWORD_RESET_TOKEN') {
            this.isTokenInvalid$.next(true);
          }
        },
        complete: () => this.navigate(),
      });
  }

  toSignUp() {
    const params = this.route.snapshot.params;
    this.router.navigate(['/sign-up', params]);
  }

  toLogIn() {
    const params = this.route.snapshot.params;
    this.router.navigate(['/login', params]);
  }

  navigate() {
    const returnUrl = this.route.snapshot.params['returnUrl'];
    this.router.navigate([returnUrl || '/explore']);
  }
}
