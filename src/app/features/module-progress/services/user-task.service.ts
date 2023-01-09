import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { GlService } from '../../common/services/gl.service';
import { UserTaskDto } from '../models/user-task.model';
import { TaskProgressDto } from '../models/task-progress.model';
import { TaskDto, TaskSubmitDto } from '../models/task.model';
import { CANCEL_SPINNER_TOKEN } from '../../common/interceptors/spinner.interceptor';

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {

    constructor(private http: HttpClient, private gl: GlService) {}

    public get(id: number): Observable<UserTaskDto> {
        return this.http.get<UserTaskDto>(`${API}/tasks/${id}/userTask`).pipe(shareReplay(1));
    }

    public getNext(moduleId: number): Observable<UserTaskDto> {
        return this.http.get<UserTaskDto>(`${API}/tasks/next/${moduleId}`).pipe(shareReplay(1));
    }

    public submit(taskSubmit: TaskSubmitDto, task: TaskDto): Observable<TaskProgressDto> {
        
        const match = this.gl.compare(taskSubmit.vertexShader, taskSubmit.fragmentShader, task.vertexShader, task.fragmentShader);

        return this.http.post<TaskProgressDto>(`${API}/tasks/${taskSubmit.id}/submit`, {...taskSubmit, match}, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).pipe(shareReplay(1));
    }

    public getScore() {
        return this.http.get<number>(`${API}/tasks/score`, {
            context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
        }).pipe(shareReplay(1));
    }

    public like(taskId: number, value: boolean): Observable<{likes: number; dislikes: number, updated: boolean}> {
        return this.http.put<{likes: number; dislikes: number, updated: boolean}>(`${API}/tasks/${taskId}/like`, {value}).pipe(shareReplay(1));
    }

    public dislike(taskId: number, value: boolean): Observable<{likes: number; dislikes: number, updated: boolean}> {
        return this.http.put<{likes: number; dislikes: number, updated: boolean}>(`${API}/tasks/${taskId}/dislike`, {value}).pipe(shareReplay(1));
    }
}