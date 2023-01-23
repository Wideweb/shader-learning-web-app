import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, Observable, Subject, takeUntil } from 'rxjs';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';
import { UserProfileLoadMe } from 'src/app/features/user-profile/state/user-profile.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shader-learning';

  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private spinner: SpinnerService, private router: Router, private store: Store) {
    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe((isAuthenticated) =>  {
      if (isAuthenticated) {
        this.store.dispatch(new UserProfileLoadMe())
      }
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
