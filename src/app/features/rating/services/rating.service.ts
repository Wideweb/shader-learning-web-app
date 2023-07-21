import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserRatingListDto } from '../models/user-rating-list.model';
import { UserRatingDto } from '../models/user-rating.model';
import { UserRatingTaskDto } from '../models/user-rating-task.model';

@Injectable({
  providedIn: 'root'
})
export class RatingService {

    constructor(private http: HttpClient) {}

    public load(): Observable<UserRatingListDto[]> {
      return this.http.get<UserRatingListDto[]>(`${API}/users/rating`).pipe(
        map(data => data.map((item, index) => ({...item, index: index + 1}))),
        shareReplay(1)
      );
    }

    public getUser(userId: number): Observable<UserRatingDto> {
      return this.http.get<UserRatingDto>(`${API}/users/${userId}/profile`).pipe(shareReplay(1));
    }
  
    public getUserTasks(userId: number): Observable<UserRatingTaskDto[]> {
      return this.http.get<UserRatingTaskDto[]>(`${API}/users/${userId}/progress`).pipe(shareReplay(1));
    }
}