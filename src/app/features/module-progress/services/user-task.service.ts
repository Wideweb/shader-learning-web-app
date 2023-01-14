import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom, lastValueFrom, Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { GlProgramSettings, GlService } from '../../common/services/gl.service';
import { UserTaskDto } from '../models/user-task.model';
import { TaskProgressDto } from '../models/task-progress.model';
import { TaskDto, TaskSubmitDto } from '../models/task.model';
import { CANCEL_SPINNER_TOKEN } from '../../common/interceptors/spinner.interceptor';

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {

    constructor(private http: HttpClient, private gl: GlService) {}

    public async get(id: number): Promise<UserTaskDto> {
        const userTask = await firstValueFrom(this.http.get<UserTaskDto>(`${API}/tasks/${id}/userTask`).pipe(shareReplay(1)));
      
        if (userTask.task.channel1) {
            const channel = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/1`, { responseType: 'blob' }).pipe(shareReplay(1)));
            userTask.task.channel1 = new File([channel], 'channel1');
        }

        if (userTask.task.channel2) {
            const channel = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/2`, { responseType: 'blob' }).pipe(shareReplay(1)));
            userTask.task.channel2 = new File([channel], 'channel2');
        }

        return userTask;
    }

    public getNext(moduleId: number): Observable<UserTaskDto> {
        return this.http.get<UserTaskDto>(`${API}/tasks/next/${moduleId}`).pipe(shareReplay(1));
    }

    public async submit(taskSubmit: TaskSubmitDto, task: TaskDto): Promise<TaskProgressDto> {
        const taskProgram: GlProgramSettings = {
            iChannel0: task.channel1,
            iChannel1: task.channel2,
            vertexShader: task.vertexShader,
            fragmentShader: task.fragmentShader,
        }

        const userProgram: GlProgramSettings = {
            iChannel0: task.channel1,
            iChannel1: task.channel2,
            vertexShader: taskSubmit.vertexShader,
            fragmentShader: taskSubmit.fragmentShader,
        }
        
        const match = await this.gl.compare(taskProgram, userProgram);

        return lastValueFrom(
            this.http.post<TaskProgressDto>(`${API}/tasks/${taskSubmit.id}/submit`, {...taskSubmit, match}, {
                context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
            }).pipe(shareReplay(1))
        );
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