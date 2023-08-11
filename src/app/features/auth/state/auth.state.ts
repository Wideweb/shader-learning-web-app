import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { catchError, firstValueFrom, of, tap, throwError } from "rxjs";
import { hasAll, hasAny } from "../../common/services/utils";
import { UserDto } from "../models/user.model";
import { AuthService } from "../services/auth.service";
import { IsTokenExpired, LoadMe, Login, LoginWithGoogle, Logout, RefreshAccessToken, RequestResetPassword, ResetPassword, SignUp, UpdateToken } from "./auth.actions";
import { isExpired } from "../services/token.utils";
import { SocialAuthService } from "@abacritt/angularx-social-login";

export interface AuthStateModel {
  user: UserDto | null;
  accessToken: AuthStateTokenModel;
  refreshToken: AuthStateTokenModel;
  loginError: any;
  signUpError: any;
  loading: boolean;
  loaded: boolean;
}

interface AuthStateTokenModel {
  value: string | '',
  expiresAt: number,
}

const defaults = (): AuthStateModel => {
  return {
    user: null,
    accessToken: {
      value: '',
      expiresAt: Number.NaN,
      // expired: true,
    },
    refreshToken: {
      value: '',
      expiresAt: Number.NaN,
      // expired: true,
    },
    loginError: null,
    signUpError: null,
    loading: false,
    loaded: false,
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
  static accessToken(state: AuthStateModel): AuthStateTokenModel {
    return state.accessToken;
  }

  @Selector()
  static refreshToken(state: AuthStateModel): AuthStateTokenModel {
    return state.refreshToken;
  }

  @Selector()
  static isAuthenticated(state: AuthStateModel): boolean {
    return !!state.refreshToken.value;
  }

  @Selector()
  static permissions(state: AuthStateModel): string[] {
    return state.user?.permissions || [];
  }

  @Selector()
  static user(state: AuthStateModel): UserDto | null {
    return state.user;
  }

  @Selector()
  static loaded(state: AuthStateModel): boolean {
    return state.loaded;
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

  constructor(private authService: AuthService, private socialAuthService: SocialAuthService) {}

  @Action(SignUp)
  async signUp(ctx: StateContext<AuthStateModel>, action: SignUp) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const sesionData = await firstValueFrom(this.authService.signUp(action.payload));
      ctx.setState(patch<AuthStateModel>({ 
        user: sesionData.user,
        accessToken: {
          value: sesionData.tokenData.accessToken,
          expiresAt: sesionData.tokenData.accessTokenExpiresAt,
        },
        refreshToken: {
          value: sesionData.tokenData.refreshToken,
          expiresAt: sesionData.tokenData.refreshTokenExpiresAt,
        },
        loginError: null,
        signUpError: null,
       }));
    } 
    catch(signUpError)
    {
      ctx.setState(patch<AuthStateModel>({ signUpError  }));
      throw signUpError;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, action: Login) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const sesionData = await firstValueFrom(this.authService.login(action.payload));
      ctx.setState(patch<AuthStateModel>({ 
        user: sesionData.user,
        accessToken: {
          value: sesionData.tokenData.accessToken,
          expiresAt: sesionData.tokenData.accessTokenExpiresAt,
        },
        refreshToken: {
          value: sesionData.tokenData.refreshToken,
          expiresAt: sesionData.tokenData.refreshTokenExpiresAt,
        },
        loginError: null,
        signUpError: null,
       }));
    } 
    catch(loginError)
    {
      ctx.setState(patch<AuthStateModel>({ loginError  }));
      throw loginError;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(LoginWithGoogle)
  async loginWithGoogle(ctx: StateContext<AuthStateModel>, action: LoginWithGoogle) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const sesionData = await firstValueFrom(this.authService.loginWithGoogle(action.token));
      ctx.setState(patch<AuthStateModel>({ 
        user: sesionData.user,
        accessToken: {
          value: sesionData.tokenData.accessToken,
          expiresAt: sesionData.tokenData.accessTokenExpiresAt,
        },
        refreshToken: {
          value: sesionData.tokenData.refreshToken,
          expiresAt: sesionData.tokenData.refreshTokenExpiresAt,
        },
        loginError: null,
        signUpError: null,
       }));
    } 
    catch(signUpError)
    {
      ctx.setState(patch<AuthStateModel>({ signUpError  }));
      throw signUpError;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(RequestResetPassword)
  resetPasswordRequest(ctx: StateContext<AuthStateModel>, action: RequestResetPassword) {
    return this.authService.requestResetPassword(action.email).pipe(
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

  @Action(ResetPassword)
  async resetPassword(ctx: StateContext<AuthStateModel>, action: ResetPassword) {
    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const sesionData = await firstValueFrom(this.authService.resetPassword(action.payload));
      ctx.setState(patch<AuthStateModel>({ 
        user: sesionData.user,
        accessToken: {
          value: sesionData.tokenData.accessToken,
          expiresAt: sesionData.tokenData.accessTokenExpiresAt,
        },
        refreshToken: {
          value: sesionData.tokenData.refreshToken,
          expiresAt: sesionData.tokenData.refreshTokenExpiresAt,
        },
        loginError: null,
        signUpError: null,
       }));
    } 
    catch(loginError)
    {
      ctx.setState(patch<AuthStateModel>({ loginError  }));
      throw loginError;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(Logout)
  logout(ctx: StateContext<AuthStateModel>) {
    const accessToken = ctx.getState().accessToken;
    const refreshToken = ctx.getState().refreshToken;

    const accessTokenExpired = !accessToken.value || isExpired(accessToken.expiresAt);
    const refreshTokenExpired = !refreshToken.value || isExpired(refreshToken.expiresAt);

    if (accessTokenExpired && refreshTokenExpired) {
      ctx.setState(defaults());
      return;
    }

    return this.authService.logout().pipe(
      tap(() => this.socialAuthService.signOut()),
      tap(() => ctx.setState(defaults())),
      catchError(() => {
        ctx.patchState(defaults());
        return of(null);
      }),
    );
  }

  @Action(LoadMe)
  async loadMe(ctx: StateContext<AuthStateModel>) {
    if (ctx.getState().user !== null || ctx.getState().loading) {
      return;
    }

    ctx.patchState({
      loaded: false,
      loading: true,
    });

    try 
    {
      const user = await firstValueFrom(this.authService.loadMe());
      ctx.setState(patch<AuthStateModel>({ user }));
    } 
    catch(error)
    {
      ctx.patchState(defaults());
      return;
    }
    finally
    {
      ctx.patchState({ 
        loaded: true,
        loading: false,
      });
    }
  }

  @Action(RefreshAccessToken)
  refreshAccessToken(ctx: StateContext<AuthStateModel>) {
    const refreshToken = ctx.getState().refreshToken.value;

    return this.authService.refreshAccessToken(refreshToken).pipe(
      tap(({token, expiresAt}) => {
        ctx.setState(
          patch<AuthStateModel>({
            accessToken: patch<AuthStateTokenModel>({
              value: token,
              expiresAt
            })
          })
        )
      })
    );
  }

  @Action(UpdateToken)
  updateAccessToken(ctx: StateContext<AuthStateModel>, action: UpdateToken) {
    if (!action.accessToken.value && !action.refreshToken.value) {
      return ctx.dispatch(new Logout());
    }

    return ctx.setState(
      patch<AuthStateModel>({
        accessToken: { ...action.accessToken },
        refreshToken: { ...action.refreshToken }
      })
    );
  }

  @Action(IsTokenExpired)
  setIsTokenExpired(ctx: StateContext<AuthStateModel>, action: IsTokenExpired) {
    const state = ctx.getState();
    if (!state.accessToken.value && action.accessTokenExpired && !state.refreshToken.value && action.refreshTokenExpired) {
      return;
    }

    ctx.setState(
      patch<AuthStateModel>({
        ...(state.accessToken.value && action.accessTokenExpired ? {accessToken: patch<AuthStateTokenModel>({value: '',})} : {}),
        ...(state.refreshToken.value && action.refreshTokenExpired ? {refreshToken: patch<AuthStateTokenModel>({value: '',})} : {}),
      })
    );

    if (action.accessTokenExpired && action.refreshTokenExpired) {
      ctx.dispatch(new Logout())
    }
  }
}