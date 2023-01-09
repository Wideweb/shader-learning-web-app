import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, shareReplay, tap } from 'rxjs';
import { API } from 'src/environments/environment';
import { TaskDto, TaskSaveDto } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

    constructor(private http: HttpClient) {}

    public get(id: number): Observable<TaskDto> {
        return this.http.get<TaskDto>(`${API}/tasks/${id}/get`).pipe(shareReplay(1));
    }

    public create(task: TaskSaveDto): Observable<number> {
        return this.http.post<number>(`${API}/tasks/create`, task).pipe(shareReplay(1));
    }

    public update(task: TaskSaveDto): Observable<number> {
        return this.http.put<number>(`${API}/tasks/${task.id}/update`, task).pipe(shareReplay(1));
    }

}