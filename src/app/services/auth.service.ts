import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, EMPTY, finalize, map, Observable, shareReplay, tap, throwError } from 'rxjs';
import { UserSignUp, UserLogIn, SessionData, User } from '../models/user.model';
import { API } from 'src/environments/environment';
import { LocalService } from './local-storage.service';
import { AuthToken } from './auth.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private accessToken: AuthToken;

  private refreshToken: AuthToken;

  private meSubject = new BehaviorSubject<User | null>(null);

  public me$ = this.meSubject.asObservable();

  public me: User | null = null;

  constructor(private http: HttpClient, private storage: LocalService) {
    this.accessToken = new AuthToken('accessToken', 'accessTokenExpiresAt', this.storage);
    this.refreshToken = new AuthToken('refreshToken', 'refreshTokenExpiresAt', this.storage);
  }

  public updateMe(): Observable<User> {
    if (this.isLoggedOut()) {
      this.me = null;
      this.meSubject.next(null);
      return EMPTY;
    }

    const request = this.http.get<User>(`${API}/me`);
    request.subscribe(userData => {
      this.me = userData;
      this.meSubject.next(userData);
    });
    return request;
  }

  public signUp(user: UserSignUp): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/signup`, user).pipe(
      tap(r => this.setSession(r)),
      shareReplay(1),
    );
  }

  public login(user: UserLogIn): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/login`, user).pipe(
      tap(r => this.setSession(r)),
      shareReplay(1),
    );
  }

  public logout() {
    return this.http.post<SessionData>(`${API}/logout`, null).pipe(
      finalize(() => this.clearSession()),
      shareReplay(1),
    );
  }

  public refreshAccessToke() {
    if (this.refreshToken.isExpired()) {
      return throwError(() => 'Unauthorized');
    }

    const body = { refreshToken: this.refreshToken.getValue() };
    return this.http.post<{ token: string; expiresIn: number }>(`${API}/refreshToken`, body)
      .pipe(
        tap(data => {
          this.accessToken.set(data.token, data.expiresIn);
        }),
        shareReplay(1),
      );
  }      

  public getAccessToken() {
    return this.accessToken.getValue();
  }

  public get isLoggedIn$(): Observable<boolean> {
    return this.refreshToken.isExpired$.pipe(map(isExpired => !isExpired));
  }

  public get isLoggedOut$(): Observable<boolean> {
    return this.refreshToken.isExpired$;
  }

  public isLoggedIn() {
    return !this.refreshToken.isExpired();
  }

  public isLoggedOut() {
    return !this.isLoggedIn();
  }

  public clearSession() {
    this.accessToken.clear();
    this.refreshToken.clear();
  }

  private setSession(sessionData: SessionData) {
    const tokenData = sessionData.tokenData;

    this.accessToken.set(tokenData.accessToken, tokenData.accessTokenLife);
    this.refreshToken.set(tokenData.refreshToken, tokenData.refreshTokenLife);

    this.me = sessionData.user;

    this.meSubject.next(sessionData.user);
  } 
}