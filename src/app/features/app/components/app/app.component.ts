import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { distinctUntilChanged, filter, map, Observable, skip, skipWhile, Subject, takeUntil } from 'rxjs';
import { UserDto } from 'src/app/features/auth/models/user.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shader-learning';

  // public score$: Observable<number>;

  public userId$: Observable<string | null>;
  
  public userName$: Observable<string | null>;
  
  public userEmail$: Observable<string | null>;

  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  @Select(AuthState.user)
  private user$!: Observable<UserDto | null>;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private spinner: SpinnerService, private router: Router) {
    // this.score$ = this.tasks.score$;

    this.userId$ = this.user$.pipe(map(u => u?.id || ''));
    this.userName$ = this.user$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.user$.pipe(map(u => u?.email || ''));

    // this.userEmail$.pipe(
    //   distinctUntilChanged(),
    //   skipWhile(email => !email),
    //   takeUntil(this.destroy$),
    // ).subscribe(() => this.tasks.updateScore());

    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      filter(isLoggedIn => !isLoggedIn)
    ).subscribe(() => this.router.navigate(['/']))
  }
  
  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  isSpinnerShown(): boolean {
    return this.spinner.isShown();
  }
}
