import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { distinctUntilChanged, interval, lastValueFrom, Subject, takeUntil, zip } from 'rxjs';
import { AuthToken } from '../../auth/services/auth.token';
import { IsTokenExpired, LoadMe, UpdateToken } from '../../auth/state/auth.actions';
import { AuthState } from '../../auth/state/auth.state';
import { LocalService } from '../../common/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService implements OnDestroy {

  private accessToken: AuthToken;

  private refreshToken: AuthToken;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private storage: LocalService) {
    this.accessToken = new AuthToken('accessToken', 'accessTokenExpiresAt', this.storage);
    this.refreshToken = new AuthToken('refreshToken', 'refreshTokenExpiresAt', this.storage);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public async init(): Promise<any> {
    // return Promise.resolve();

    zip(this.refreshToken.update$, this.accessToken.update$)
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(([refreshToken, accessToken]) => {
        this.store.dispatch(new UpdateToken(accessToken, refreshToken));
      });

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.store.dispatch(new IsTokenExpired(this.accessToken.isExpired(), this.refreshToken.isExpired())));

    this.store.select(AuthState.auth)
      .pipe(
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        takeUntil(this.destroy$)
      )
      .subscribe(auth => {
        this.accessToken.set(auth.accessToken.value, auth.accessToken.life);
        this.refreshToken.set(auth.refreshToken.value, auth.refreshToken.life);
      });

    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    if (isAuthenticated) {
      await lastValueFrom(this.store.dispatch(new LoadMe()));
    }
  }
}