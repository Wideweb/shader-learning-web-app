import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { FeedbackDto } from '../models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {

    constructor(private http: HttpClient) {}

    public load(): Observable<FeedbackDto[]> {
        return this.http.get<FeedbackDto[]>(`${API}/modules/list`).pipe(shareReplay(1));
    }
}