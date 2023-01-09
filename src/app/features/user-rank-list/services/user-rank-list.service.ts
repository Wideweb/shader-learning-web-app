import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { UserRankListDto } from '../models/user-rank-list.model';

@Injectable({
  providedIn: 'root'
})
export class UserRankListService {

    constructor(private http: HttpClient) {}

    public load(): Observable<UserRankListDto[]> {
      return this.http.get<UserRankListDto[]>(`${API}/users/rating`).pipe(shareReplay(1));
    }
}