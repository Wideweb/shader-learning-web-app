import { Injectable, OnDestroy } from '@angular/core';
import { Store } from '@ngxs/store';
import { distinctUntilChanged, filter, interval, Subject, takeUntil, zip } from 'rxjs';
import { AuthToken } from '../../auth/services/auth.token';
import { IsTokenExpired, LoadMe, LoginWithGoogle, UpdateToken } from '../../auth/state/auth.actions';
import { AuthState } from '../../auth/state/auth.state';
import { LocalService } from '../../common/services/local-storage.service';
import { LocationHistoryService } from '../../common/services/location-history.service';
import { SocialAuthService } from '@abacritt/angularx-social-login';

@Injectable({
  providedIn: 'root',
})
export class AppInitService implements OnDestroy {

  private accessToken: AuthToken;

  private refreshToken: AuthToken;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private storage: LocalService, private locationHistory: LocationHistoryService, private socialAuthService: SocialAuthService) {
    this.accessToken = new AuthToken('accessToken', 'accessTokenExpiresAt', this.storage);
    this.refreshToken = new AuthToken('refreshToken', 'refreshTokenExpiresAt', this.storage);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public async init(): Promise<any> {
    this.locationHistory.init();

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
        if (auth.refreshToken.value) {
          this.accessToken.set(auth.accessToken.value, auth.accessToken.expiresAt);
          this.refreshToken.set(auth.refreshToken.value, auth.refreshToken.expiresAt);
        } else {
          this.accessToken.clear();
          this.refreshToken.clear();
        }
      });

    this.socialAuthService.authState.pipe(
      filter(user => !!user),
      takeUntil(this.destroy$),
    ).subscribe((user) => this.store.dispatch(new LoginWithGoogle(user.idToken)));

    const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
    if (isAuthenticated) {
      this.store.dispatch(new LoadMe());
    }
  }
}