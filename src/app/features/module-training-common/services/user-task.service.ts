import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { firstValueFrom, lastValueFrom, Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { GlService } from '../../common/services/gl.service';
import { UserTaskDto } from '../models/user-task.model';
import { TaskDto, TaskFeedbackDto, TaskSubmitDto, TaskSubmitResultDto } from '../models/task.model';
import { CANCEL_SPINNER_TOKEN } from '../../common/interceptors/spinner.interceptor';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from '../../app/app.constants';
import { GlProgramSettings, GlScene } from '../../common/gl-scene/models';

@Injectable({
  providedIn: 'root',
})
export class UserTaskService {

    constructor(private http: HttpClient, private gl: GlService) {}

    public async get(id: number): Promise<UserTaskDto> {
        const userTask = await firstValueFrom(this.http.get<UserTaskDto>(`${API}/tasks/${id}/userTask`).pipe(shareReplay(1)));

        const channelsFeatures = userTask.task.channels.map(async (_, index) => {
            const fileBlob: Blob = await firstValueFrom(this.http.get(`${API}/tasks/${id}/channel/${index}`, { responseType: 'blob' }).pipe(shareReplay(1)));
            const file = new File([fileBlob], `channel${index}`);
            return { file };
        });
    
        userTask.vertexShader = userTask.vertexShader || DEFAULT_VERTEX_SHADER;
        userTask.fragmentShader = userTask.fragmentShader || DEFAULT_FRAGMENT_SHADER;

        userTask.task.channels = await Promise.all(channelsFeatures);
        userTask.task.vertexShader = userTask.task.vertexShader || DEFAULT_VERTEX_SHADER;

        userTask.task.sceneSettings = userTask.task.sceneSettings ? JSON.parse(userTask.task.sceneSettings as any) : new GlScene();

        return userTask;
    }

    public getNext(moduleId: number): Observable<UserTaskDto> {
        return this.http.get<UserTaskDto>(`${API}/tasks/next/${moduleId}`).pipe(shareReplay(1));
    }

    public async submit(taskSubmit: TaskSubmitDto, task: TaskDto): Promise<TaskSubmitResultDto> {
        const taskProgram: GlProgramSettings = {
            scene: task.sceneSettings,
            vertexShader: task.vertexShader,
            fragmentShader: task.fragmentShader,
            channels: task.channels.map(c => ({ file: c.file })),
        }

        const userProgram: GlProgramSettings = {
            scene: task.sceneSettings,
            vertexShader: taskSubmit.vertexShader,
            fragmentShader: taskSubmit.fragmentShader,
            channels: task.channels.map(c => ({ file: c.file })),
        }

        let match = 0;
        if (task.animated) {
            match = await this.gl.compareAnimations(taskProgram, userProgram, 1024, 512, task.animationSteps!, task.animationStepTime! / 1000);
        } else {
            match = await this.gl.compare(taskProgram, userProgram, 1024, 512);
        }

        return lastValueFrom(
            this.http.post<TaskSubmitResultDto>(`${API}/tasks/${taskSubmit.id}/submit`, {...taskSubmit, match}, {
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

    public saveFeedback(taskId: number, feedback: TaskFeedbackDto): Observable<void> {
        return this.http.post<void>(`${API}/tasks/${taskId}/feedback`, {...feedback, message: feedback.other ? feedback.message : ''}).pipe(shareReplay(1));
    }
}