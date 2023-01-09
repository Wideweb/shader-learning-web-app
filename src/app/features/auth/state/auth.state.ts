import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { catchError, of, tap, throwError } from "rxjs";
import { hasAll, hasAny } from "../../common/services/utils";
import { SessionData } from "../models/session-data.model";
import { UserDto } from "../models/user.model";
import { AuthService } from "../services/auth.service";
import { AuthClear, IsAccessTokenExpired, IsRefreshTokenExpired, LoadMe, Login, Logout, RefreshAccessToken, SignUp, UpdateAccessToken, UpdateRefreshToken } from "./auth.actions";

export interface AuthStateModel {
  user: UserDto | null;
  accessToken: AuthStateTokenModel;
  refreshToken: AuthStateTokenModel;
  loginError: any;
  signUpError: any;
}

interface AuthStateTokenModel {
  value: string | '',
  life: number,
  expired: boolean,
}

const defaults = (): AuthStateModel => {
  return {
    user: null,
    accessToken: {
      value: '',
      life: Number.NaN,
      expired: true,
    },
    refreshToken: {
      value: '',
      life: Number.NaN,
      expired: true,
    },
    loginError: null,
    signUpError: null,
  };
}

@State<AuthStateModel>({
  name: 'Auth',
  defaults: defaults()
})
@Injectable()
export class AuthState {

  @Selector()
  static auth(state: AuthStateModel): AuthStateModel {
    return state;
  }

  @Selector()
  static accessToken(state: AuthStateModel): string | null {
    return state.accessToken.value;
  }

  @Selector()
  static refreshToken(state: AuthStateModel): string | null {
    return state.refreshToken.value;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !state.refreshToken.expired;
  }

  @Selector()
  static permissions(state: AuthStateModel): string[] {
    return state.user?.permissions || [];
  }

  @Selector()
  static user(state: AuthStateModel): UserDto | null {
    return state.user;
  }

  static hasAllPermissions(permissions: string[]) {
    return createSelector([AuthState.permissions], (userPermissions: string[]) => {
      return hasAll(userPermissions, permissions);
    });
  }

  static hasAnyPermissions(permissions: string[]) {
    return createSelector([AuthState.permissions], (userPermissions: string[]) => {
      return hasAny(userPermissions, permissions);
    });
  }

  constructor(private authService: AuthService) {}

  @Action(SignUp)
  signUp(ctx: StateContext<AuthStateModel>, action: SignUp) {
    return this.authService.signUp(action.payload).pipe(
      tap((sesionData: SessionData) => {
        ctx.setState({
          user: sesionData.user,
          accessToken: {
            value: sesionData.tokenData.accessToken,
            life: sesionData.tokenData.accessTokenLife,
            expired: false,
          },
          refreshToken: {
            value: sesionData.tokenData.refreshToken,
            life: sesionData.tokenData.refreshTokenLife,
            expired: false,
          },
          loginError: null,
          signUpError: null,
        });
      }),
      catchError((err) => {
        ctx.setState(
          patch<AuthStateModel>({
            signUpError: err
          })
        );
        return throwError(() => err);
      }),
    );
  }

  @Action(Login)
  login(ctx: StateContext<AuthStateModel>, action: Login) {
    return this.authService.login(action.payload).pipe(
      tap((sesionData: SessionData) => {
        ctx.setState({
          user: sesionData.user,
          accessToken: {
            value: sesionData.tokenData.accessToken,
            life: sesionData.tokenData.accessTokenLife,
            expired: false,
          },
          refreshToken: {
            value: sesionData.tokenData.refreshToken,
            life: sesionData.tokenData.refreshTokenLife,
            expired: false,
          },
          loginError: null,
          signUpError: null,
        });
      }),
      catchError((err) => {
        ctx.setState(
          patch<AuthStateModel>({
            loginError: err
          })
        );
        return throwError(() => err);
      }),
    );
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    if (ctx.getState().accessToken.expired && ctx.getState().refreshToken.expired) {
      ctx.setState(defaults());
      return;
    }

    return this.authService.logout().pipe(
      tap(() => ctx.setState(defaults())),
      catchError(() => {
        ctx.patchState(defaults());
        return of(null);
      }),
    );
  }

  @Action(LoadMe)
  loadMe(ctx: StateContext<AuthStateModel>) {
    return this.authService.loadMe().pipe(
      tap((user) => {
        ctx.patchState({
          user: user,
        });
      }),
      catchError(() => {
        ctx.patchState(defaults());
        return of(null);
      }),
    );
  }

  @Action(RefreshAccessToken)
  refreshAccessToken(ctx: StateContext<AuthStateModel>) {
    const refreshToken = ctx.getState().refreshToken.value;

    return this.authService.refreshAccessToken(refreshToken).pipe(
      tap(({token, expiresIn}) => {
        ctx.setState(
          patch<AuthStateModel>({
            accessToken: patch<AuthStateTokenModel>({
              value: token,
              life: expiresIn
            })
          })
        )
      })
    );
  }

  @Action(UpdateAccessToken)
  updateAccessToken(ctx: StateContext<AuthStateModel>, action: UpdateAccessToken) {
    return ctx.setState(
      patch<AuthStateModel>({
        accessToken: { ...action.payload }
      })
    );
  }

  @Action(IsAccessTokenExpired)
  setIsAccessTokenExpired(ctx: StateContext<AuthStateModel>, action: IsAccessTokenExpired) {
    return ctx.setState(
      patch<AuthStateModel>({
        accessToken: patch<AuthStateTokenModel>({
          expired: action.payload,
        })
      })
    );
  }

  @Action(UpdateRefreshToken)
  updateRefreshToken(ctx: StateContext<AuthStateModel>, action: UpdateRefreshToken) {
    return ctx.setState(
      patch<AuthStateModel>({
        refreshToken: { ...action.payload }
      })
    );
  }

  @Action(IsRefreshTokenExpired)
  setIsRefreshTokenExpired(ctx: StateContext<AuthStateModel>, action: IsRefreshTokenExpired) {
    return ctx.setState(
      patch<AuthStateModel>({
        refreshToken: patch<AuthStateTokenModel>({
          expired: action.payload,
        })
      })
    );
  }

  @Action(AuthClear)
  clear(ctx: StateContext<AuthStateModel>) {
    return ctx.setState(defaults());
  }
}