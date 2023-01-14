import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { TaskDto, TaskSaveDto } from '../models/task.model';
import { FileService } from '../../common/services/file.service';

@Injectable({
  providedIn: 'root',
})
export class TaskService {

    constructor(private http: HttpClient, private file: FileService) {}

    public async get(id: number): Promise<TaskDto> {
      const task = await firstValueFrom(this.http.get<TaskDto>(`${API}/tasks/${id}/get`).pipe(shareReplay(1)));
      
      if (task.channel1) {
        const channel = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/1`, { responseType: 'blob' }).pipe(shareReplay(1)));
        task.channel1 = new File([channel], 'channel1');
      }

      if (task.channel2) {
        const channel = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/2`, { responseType: 'blob' }).pipe(shareReplay(1)));
        task.channel2 = new File([channel], 'channel2');
      }

      return task;
    }

    public async create(task: TaskSaveDto): Promise<number> {
      let channel1 = null;
      let channel2 = null;

      if (task.channel1) {
        channel1 = await firstValueFrom(this.file.uploadTemp(task.channel1 as File));
      }

      if (task.channel2) {
        channel2 = await firstValueFrom(this.file.uploadTemp(task.channel2 as File));
      }

      return await firstValueFrom(this.http.post<number>(`${API}/tasks/create`, {...task, channel1, channel2}).pipe(shareReplay(1)));
    }

    public async update(task: TaskSaveDto): Promise<number> {
      let channel1 = null;
      let channel2 = null;

      if (task.channel1) {
        channel1 = await firstValueFrom(this.file.uploadTemp(task.channel1 as File));
      }

      if (task.channel2) {
        channel2 = await firstValueFrom(this.file.uploadTemp(task.channel2 as File));
      }

      return await firstValueFrom(this.http.put<number>(`${API}/tasks/${task.id}/update`, {...task, channel1, channel2}).pipe(shareReplay(1)));
    }
}