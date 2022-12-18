import { Injectable } from '@angular/core';
import { Task, TaskSubmitResult, TaskSubmit } from '../models/task.model';
import { HttpClient, HttpHeaders, HttpContext } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { CANCEL_SPINNER_TOKEN } from '../interceptors/spinner.interceptor';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

    private scoreSubject = new BehaviorSubject<number>(0);

    public score$ = this.scoreSubject.asObservable();

    constructor(private http: HttpClient) {}

    public getNext(): Observable<Task> {
        return this.http.get<Task>(`http://localhost:3000/tasks/next`).pipe(shareReplay(1));
    }

    public submit(taskSubmit: TaskSubmit): Observable<TaskSubmitResult> {
        return this.http.post<TaskSubmitResult>(`http://localhost:3000/tasks/${taskSubmit.id}/submit`, taskSubmit, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).pipe(
            tap(() => this.updateScore()),
            shareReplay(1)
        );
    }

    public updateScore() {
        return this.http.get<number>(`http://localhost:3000/tasks/score`, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).subscribe(score => {
            this.scoreSubject.next(score);
        });
    }
}