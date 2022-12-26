import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserProfileDto, UserRankedListDto } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {

    constructor(private http: HttpClient) {}

    public getRankedList(): Observable<UserRankedListDto[]> {
      return this.http.get<UserRankedListDto[]>(`${API}/users/rating`).pipe(shareReplay(1));
    }

    public getProfile(userId: number): Observable<UserProfileDto> {
      return this.http.get<UserProfileDto>(`${API}/users/${userId}/profile`).pipe(shareReplay(1));
    }
}