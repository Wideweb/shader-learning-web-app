import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserDto } from '../models/user.model';
import { UserSignUp } from '../models/user-sign-up.model';
import { SessionData } from '../models/session-data.model';
import { UserLogIn } from '../models/user-login.model';

@Injectable()
export class AuthService {

  constructor(private http: HttpClient) { }

  public loadMe(): Observable<UserDto> {
    return this.http.get<UserDto>(`${API}/me`).pipe(
      shareReplay(1),
    );
  }

  public signUp(user: UserSignUp): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/signup`, user).pipe(
      shareReplay(1),
    );
  }

  public login(user: UserLogIn): Observable<SessionData> {
    return this.http.post<SessionData>(`${API}/login`, user).pipe(
      shareReplay(1),
    );
  }

  public logout() {
    return this.http.post<void>(`${API}/logout`, null).pipe(
      shareReplay(1),
    );
  }

  public refreshAccessToken(refreshToken: string) {
    return this.http.post<{ token: string; expiresIn: number }>(`${API}/refreshToken`, { refreshToken }).pipe(
      shareReplay(1),
    );
  }
}