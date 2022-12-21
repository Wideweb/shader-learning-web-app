import { Injectable } from '@angular/core';
import { Task, TaskSubmitResult, TaskSubmit } from '../models/task.model';
import { HttpClient, HttpContext } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { CANCEL_SPINNER_TOKEN } from '../interceptors/spinner.interceptor';
import { API } from 'src/environments/environment';
import { GlService } from './gl.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

    private scoreSubject = new BehaviorSubject<number>(0);

    public score$ = this.scoreSubject.asObservable();

    constructor(private http: HttpClient, private gl: GlService) {}

    public getNext(): Observable<Task> {
        return this.http.get<Task>(`${API}/tasks/next`).pipe(shareReplay(1));
    }

    public submit(taskSubmit: TaskSubmit, task: Task): Observable<TaskSubmitResult> {
        
        const match = this.gl.compare(taskSubmit.vertexShader, taskSubmit.fragmentShader, task.vertexShader, task.fragmentShader);

        return this.http.post<TaskSubmitResult>(`${API}/tasks/${taskSubmit.id}/submit`, {...taskSubmit, match}, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).pipe(
            tap(() => this.updateScore()),
            shareReplay(1)
        );
    }

    public updateScore() {
        return this.http.get<number>(`${API}/tasks/score`, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).subscribe(score => {
            this.scoreSubject.next(score);
        });
    }
}