import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserProfileDto } from '../models/user-profile.model';
import { TaskProgressDto } from '../models/task-progress.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {

    constructor(private http: HttpClient) {}

    public getProfile(userId: number): Observable<UserProfileDto> {
      return this.http.get<UserProfileDto>(`${API}/users/${userId}/profile`).pipe(shareReplay(1));
    }

    public getProgress(userId: number): Observable<TaskProgressDto[]> {
      return this.http.get<TaskProgressDto[]>(`${API}/users/${userId}/progress`).pipe(shareReplay(1));
  }

  public getProfileMe(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${API}/me/profile`).pipe(shareReplay(1));
  }

  public getProgressMe(): Observable<TaskProgressDto[]> {
    return this.http.get<TaskProgressDto[]>(`${API}/me/progress`).pipe(shareReplay(1));
}
}