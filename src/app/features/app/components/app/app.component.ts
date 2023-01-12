import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { UserDto } from 'src/app/features/auth/models/user.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';
import { UserProfileLoadMe } from 'src/app/features/user-profile/state/user-profile.actions';
import { UserProfileState } from 'src/app/features/user-profile/state/user-profile.state';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shader-learning';

  @Select(UserProfileState.meRank)
  public userRank$!: Observable<number>;

  public userId$: Observable<number | null>;
  
  public userName$: Observable<string | null>;
  
  public userEmail$: Observable<string | null>;

  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  @Select(AuthState.user)
  private user$!: Observable<UserDto | null>;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private spinner: SpinnerService, private router: Router, private store: Store) {

    this.userId$ = this.user$.pipe(map(u => u?.id || null));
    this.userName$ = this.user$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.user$.pipe(map(u => u?.email || ''));

    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((isAuthenticated) =>  {
      if (!isAuthenticated) {
        this.router.navigate(['/']);
        return;
      }

      this.store.dispatch(new UserProfileLoadMe())
    });
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
