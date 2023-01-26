import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { TaskDto, TaskSaveDto } from '../models/task.model';
import { FileService } from '../../common/services/file.service';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from '../../app/app.constants';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

    constructor(private http: HttpClient, private file: FileService) {}

    public async get(id: number): Promise<TaskDto> {
      const task = await firstValueFrom(this.http.get<TaskDto>(`${API}/tasks/${id}/get`).pipe(shareReplay(1)));

      const channelsFeatures = task.channels.map(async (_, index) => {
        const fileBlob = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/${index}`, { responseType: 'blob' }).pipe(shareReplay(1)));
        const file = new File([fileBlob], `channel${index}`);
        return { file };
      });

      const channels = await Promise.all(channelsFeatures);

      task.vertexShader = task.vertexShader || DEFAULT_VERTEX_SHADER;
      task.fragmentShader = task.fragmentShader || DEFAULT_FRAGMENT_SHADER;

      return {...task, channels};
    }

    public async create(task: TaskSaveDto): Promise<number> {
      const channelsFeatures = task.channels.map(async channel => {
        const file = await firstValueFrom(this.file.uploadTemp(channel.file as File));
        return { file };
      });

      const channels = await Promise.all(channelsFeatures);

      return await firstValueFrom(this.http.post<number>(`${API}/tasks/create`, {...task, channels}).pipe(shareReplay(1)));
    }

    public async update(task: TaskSaveDto): Promise<number> {
      const channelsFeatures = task.channels.map(async channel => {
        const file = await firstValueFrom(this.file.uploadTemp(channel.file as File));
        return { file };
      });

      const channels = await Promise.all(channelsFeatures);

      return await firstValueFrom(this.http.put<number>(`${API}/tasks/${task.id}/update`, {...task, channels}).pipe(shareReplay(1)));
    }
}