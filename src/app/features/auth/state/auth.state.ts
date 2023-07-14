import { Injectable } from "@angular/core";
import { Action, createSelector, Selector, State, StateContext } from "@ngxs/store";
import { patch } from '@ngxs/store/operators';
import { catchError, firstValueFrom, of, tap, throwError } from "rxjs";
import { hasAll, hasAny } from "../../common/services/utils";
import { SessionData } from "../models/session-data.model";
import { UserDto } from "../models/user.model";
import { AuthService } from "../services/auth.service";
import { IsTokenExpired, LoadMe, Login, Logout, RefreshAccessToken, RequestResetPassword, ResetPassword, SignUp, UpdateToken } from "./auth.actions";

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

  constructor(private authService: AuthService) {}

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

  @Action(UpdateToken)
  updateAccessToken(ctx: StateContext<AuthStateModel>, action: UpdateToken) {
    if (action.accessToken.expired && action.refreshToken.expired) {
      return ctx.setState(defaults());
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
    if (state.accessToken.expired === action.accessToken && state.refreshToken.expired === action.refreshToken) {
      return;
    }

    ctx.setState(
      patch<AuthStateModel>({
        accessToken: patch<AuthStateTokenModel>({
          expired: action.accessToken,
        }),
        refreshToken: patch<AuthStateTokenModel>({
          expired: action.refreshToken,
        })
      })
    );

    if (action.accessToken && action.refreshToken) {
      ctx.dispatch(new Logout())
    }
  }
}