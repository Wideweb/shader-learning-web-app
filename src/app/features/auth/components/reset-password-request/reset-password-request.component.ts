import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { RequestResetPassword } from 'src/app/features/auth/state/auth.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { AuthState } from '../../state/auth.state';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'reset-password-request',
  templateUrl: './reset-password-request.component.html',
  styleUrls: ['./reset-password-request.component.css']
})
export class ResetPasswordRequestComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  public isSent$: Subject<boolean> = new BehaviorSubject<boolean>(false);

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private pageMeta: PageMetaService,
  ) {
    this.form = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.email]),
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

    this.store.dispatch(new RequestResetPassword(this.form.value.email))
      .pipe()
      .subscribe({
        error: (e) => console.log(e),
        complete: () => this.isSent$.next(true),
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
