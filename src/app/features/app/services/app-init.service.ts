import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { forkJoin, interval, Observable, Subject, takeUntil } from 'rxjs';
import { AuthToken } from '../../auth/services/auth.token';
import { IsAccessTokenExpired, IsRefreshTokenExpired, LoadMe, UpdateAccessToken, UpdateRefreshToken } from '../../auth/state/auth.actions';
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

  public init(): Observable<any> {
    this.accessToken.update$
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.store.dispatch(new UpdateAccessToken(e)));

    this.refreshToken.update$
      .pipe(takeUntil(this.destroy$))
      .subscribe(e => this.store.dispatch(new UpdateRefreshToken(e)));

    interval(1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.store.dispatch(new IsAccessTokenExpired(this.accessToken.isExpired())),
        this.store.dispatch(new IsRefreshTokenExpired(this.refreshToken.isExpired()))
      });

    this.store.select(AuthState.auth)
      .pipe(takeUntil(this.destroy$))
      .subscribe(auth => {
        this.accessToken.set(auth.accessToken.value, auth.accessToken.life);
        this.refreshToken.set(auth.refreshToken.value, auth.refreshToken.life);
      });

    return forkJoin([
      this.store.dispatch(new LoadMe())
    ]);
  }
}