import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleDto } from '../models/module.model';
import { CreateModuleDto } from '../models/module-create.model';
import { UpdateModuleDto } from '../models/module-update.model';
import { ModuleTaskListDto } from '../models/module-task-list.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {

    constructor(private http: HttpClient) {}

    public get(moduleId: number): Observable<ModuleDto> {
        return this.http.get<ModuleDto>(`${API}/modules/${moduleId}/get`).pipe(shareReplay(1));
    }

    public create(module: CreateModuleDto): Observable<number> {
        return this.http.post<number>(`${API}/modules/create`, module).pipe(shareReplay(1));
    }

    public update(module: UpdateModuleDto): Observable<number> {
        return this.http.put<number>(`${API}/modules/${module.id}/update`, module).pipe(shareReplay(1));
    }

    public updateName(moduleId: number, name: string): Observable<number> {
        return this.http.put<number>(`${API}/modules/${moduleId}/name`, {name}).pipe(shareReplay(1));
    }

    public updateDescription(moduleId: number, description: string): Observable<number> {
        return this.http.put<number>(`${API}/modules/${moduleId}/description`, {description}).pipe(shareReplay(1));
    }

    public toggleLock(moduleId: number): Observable<boolean> {
        return this.http.put<boolean>(`${API}/modules/${moduleId}/toggleLock`, { moduleId }).pipe(shareReplay(1));
    }

    public taskList(moduleId: number): Observable<ModuleTaskListDto[]> {
        return this.http.get<ModuleTaskListDto[]>(`${API}/modules/${moduleId}/tasks/list`).pipe(shareReplay(1));
    }

    public reorderTasks(moduleId: number, oldOrder: number, newOrder: number) {
        return this.http.put<boolean>(`${API}/modules/${moduleId}/tasks/reorder`, { oldOrder, newOrder }).pipe(shareReplay(1));
    }

    public toggleTaskVisibility(taskId: number): Observable<boolean> {
        return this.http.put<boolean>(`${API}/tasks/${taskId}/toggleVisibility`, { taskId }).pipe(shareReplay(1));
    }
}