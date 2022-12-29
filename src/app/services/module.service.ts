import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { GlService } from './gl.service';
import { CreateModuleDto, ModuleDto, ModuleListDto, UpdateModuleDto, UserModuleProgressDto } from '../models/module.model';
import { TaskListDto } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {

    private scoreSubject = new BehaviorSubject<number>(0);

    public score$ = this.scoreSubject.asObservable();

    constructor(private http: HttpClient, private gl: GlService) {}

    public get(moduleId: number): Observable<ModuleDto> {
        return this.http.get<ModuleDto>(`${API}/modules/${moduleId}/get`).pipe(shareReplay(1));
    }

    public getUserProgress(moduleId: number): Observable<UserModuleProgressDto> {
        return this.http.get<UserModuleProgressDto>(`${API}/modules/${moduleId}/user/progress`).pipe(shareReplay(1));
    }

    public create(module: CreateModuleDto): Observable<number> {
        return this.http.post<number>(`${API}/modules/create`, module).pipe(shareReplay(1));
    }

    public update(module: UpdateModuleDto): Observable<number> {
        return this.http.put<number>(`${API}/modules/${module.id}/update`, module).pipe(shareReplay(1));
    }

    public list(): Observable<ModuleListDto[]> {
        return this.http.get<ModuleListDto[]>(`${API}/modules/list`).pipe(shareReplay(1));
    }

    public taskList(moduleId: number): Observable<TaskListDto[]> {
        return this.http.get<TaskListDto[]>(`${API}/modules/${moduleId}/tasks/list`).pipe(shareReplay(1));
    }

    public reorderTasks(moduleId: number, oldOrder: number, newOrder: number) {
        return this.http.put<boolean>(`${API}/modules/${moduleId}/tasks/reorder`, { oldOrder, newOrder }).pipe(shareReplay(1));
    }
}