import { Injectable } from '@angular/core';
import { Task, TaskSubmitResult, TaskSubmit, UserTaskResultDto, UserTask, CreateTaskDto, UpdateTaskDto, TaskListDto } from '../models/task.model';
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

    public get(id: number): Observable<Task> {
        return this.http.get<Task>(`${API}/tasks/${id}/get`).pipe(shareReplay(1));
    }

    public create(task: CreateTaskDto): Observable<number> {
        return this.http.post<number>(`${API}/tasks/create`, task).pipe(shareReplay(1));
    }

    public update(task: UpdateTaskDto): Observable<number> {
        return this.http.put<number>(`${API}/tasks/${task.id}/update`, task).pipe(shareReplay(1));
    }

    public toggleVisibility(id: number): Observable<boolean> {
        return this.http.get<boolean>(`${API}/tasks/${id}/toggleVisibility`).pipe(shareReplay(1));
    }

    public getUserTask(id: number): Observable<UserTask> {
        return this.http.get<UserTask>(`${API}/tasks/${id}/userTask`).pipe(shareReplay(1));
    }

    public getNext(moduleId: number): Observable<UserTask> {
        return this.http.get<UserTask>(`${API}/tasks/next/${moduleId}`).pipe(shareReplay(1));
    }

    public getProgress(): Observable<UserTaskResultDto[]> {
        return this.http.get<UserTaskResultDto[]>(`${API}/tasks/progress`).pipe(shareReplay(1));
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

    public like(taskId: number, value: boolean): Observable<{likes: number; dislikes: number, updated: boolean}> {
        return this.http.put<{likes: number; dislikes: number, updated: boolean}>(`${API}/tasks/${taskId}/like`, {value}).pipe(shareReplay(1));
    }

    public dislike(taskId: number, value: boolean): Observable<{likes: number; dislikes: number, updated: boolean}> {
        return this.http.put<{likes: number; dislikes: number, updated: boolean}>(`${API}/tasks/${taskId}/dislike`, {value}).pipe(shareReplay(1));
    }
}