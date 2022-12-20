import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserSignUp, UserLogIn, SessionData, User } from '../models/user.model';
import { API } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private meSubject = new BehaviorSubject<User | null>(null);

  public me$ = this.meSubject.asObservable();

  constructor(private http: HttpClient) {}

  public updateMe() {
    return this.http.get<User>(`${API}/me`).subscribe(userData => {
      this.meSubject.next(userData);
    });
  }

  public signUp(user: UserSignUp): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/signup`, user).pipe(tap(r => this.setSession(r)));
  }

  public login(user: UserLogIn): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/login`, user).pipe(tap(r => this.setSession(r)));
  }

  private setSession(sessionData: SessionData) {
    const tokenData = sessionData.tokenData;

    localStorage.setItem('id_token', tokenData.token);
    localStorage.setItem("expires_at", JSON.stringify(this.computeExpiresAt(tokenData.expiresIn).valueOf()) );

    this.meSubject.next(sessionData.user);
  }          

  public logout() {
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
  }

  public isLoggedIn() {
    return this.getExpiresAt() > this.getNowUTC();
  }

  public isLoggedOut() {
    return !this.isLoggedIn();
  }

  private getNowUTC(): number {
    var date = new Date();
    var nowUTC = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
    return nowUTC;
  }

  private computeExpiresAt(expiresIn: number): number {
    return this.getNowUTC() + expiresIn * 1000;
  }

  private getExpiresAt(): number {
    const expiration = localStorage.getItem("expires_at");
    if (!expiration) {
      return 0;
    }

    const expiresAt = JSON.parse(expiration);
    return expiresAt
  } 
}