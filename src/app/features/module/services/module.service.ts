import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleDto } from '../models/module.model';
import { CreateModuleDto } from '../models/module-create.model';
import { UpdateModuleDto } from '../models/module-update.model';
import { ModuleTaskListDto } from '../models/module-task-list.model';
import { FileService } from '../../common/services/file.service';

@Injectable({
  providedIn: 'root',
})
export class ModuleService {

    constructor(private http: HttpClient, private file: FileService) {}

    public async get(moduleId: number): Promise<ModuleDto> {
        const module = await firstValueFrom(this.http.get<ModuleDto>(`${API}/modules/${moduleId}/get`).pipe(shareReplay(1)));

        let cover = null;
        if (module.cover) {
            const fileBlob = await firstValueFrom(this.http.get(`${API}/modules/${moduleId}/cover`, { responseType: 'blob' }).pipe(shareReplay(1)));
            cover = new File([fileBlob], `cover`);
        }

        let pageHeaderImage = null;
        if (module.pageHeaderImage) {
            const fileBlob = await firstValueFrom(this.http.get(`${API}/modules/${moduleId}/pageHeaderImage`, { responseType: 'blob' }).pipe(shareReplay(1)));
            pageHeaderImage = new File([fileBlob], `page-header`);
        }

        return {...module, cover, pageHeaderImage};
    }

    public async create(module: CreateModuleDto): Promise<number> {
        const cover = module.cover ? await firstValueFrom(this.file.uploadTemp(module.cover as File)) : null;

        return await firstValueFrom(this.http.post<number>(`${API}/modules/create`, {...module, cover}).pipe(shareReplay(1)));
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

    public async updateCover(moduleId: number, cover: File): Promise<number> {
        const file = cover ? await firstValueFrom(this.file.uploadTemp(cover as File)) : null;

        return await firstValueFrom(this.http.put<number>(`${API}/modules/${moduleId}/cover`, {file}).pipe(shareReplay(1)));
    }

    public async updatePageHeaderImage(moduleId: number, pageHeaderImage: File): Promise<number> {
        const file = pageHeaderImage ? await firstValueFrom(this.file.uploadTemp(pageHeaderImage as File)) : null;

        return await firstValueFrom(this.http.put<number>(`${API}/modules/${moduleId}/pageHeaderImage`, {file}).pipe(shareReplay(1)));
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