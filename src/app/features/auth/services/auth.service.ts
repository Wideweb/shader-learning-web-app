import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserDto } from '../models/user.model';
import { UserSignUp } from '../models/user-sign-up.model';
import { SessionData } from '../models/session-data.model';
import { UserLogIn } from '../models/user-login.model';
import { ResetPasswordData } from '../models/reset-password-data.model';
import { CANCEL_AUTH } from '../interceptors/auth.interceptor';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  public loadMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${API}/me`).pipe(
      shareReplay(1),
    );
  }

  public signUp(user: UserSignUp, ref: string): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/signup`, {...user, ref}).pipe(
      shareReplay(1),
    );
  }

  public login(user: UserLogIn): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/login`, user).pipe(
      shareReplay(1),
    );
  }

  public loginWithGoogle(token: string, ref: string): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/google-login`, { token, ref }).pipe(
      shareReplay(1),
    );
  }

  public requestResetPassword(email: string): Observable<void> {
    return this.http.post<void>(`${API}/requestResetPassword`, {email}).pipe(
      shareReplay(1),
    );
  }

  public resetPassword(data: ResetPasswordData): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/resetPassword`, data).pipe(
      shareReplay(1),
    );
  }

  public logout() {
    return this.http.post<void>(`${API}/logout`, null).pipe(
      shareReplay(1),
    );
  }

  public refreshAccessToken(refreshToken: string) {
    return this.http.post<{ token: string; expiresAt: number }>(`${API}/refreshToken`, { refreshToken }, {
      context: new HttpContext().set(CANCEL_AUTH, true)
    }).pipe(
      shareReplay(1),
    );
  }
}