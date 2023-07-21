import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { FeedbackDto } from '../models/feedback.model';
import { CANCEL_SPINNER_TOKEN } from '../../common/interceptors/spinner.interceptor';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {

    constructor(private http: HttpClient) {}

    public load(): Observable<FeedbackDto[]> {
        return this.http.get<FeedbackDto[]>(`${API}/feedback/list`, {
          context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).pipe(shareReplay(1));
    }
}