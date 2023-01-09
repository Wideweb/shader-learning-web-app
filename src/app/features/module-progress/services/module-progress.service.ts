import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleProgressDto } from '../models/module-progress.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleProgressService {

    private scoreSubject = new BehaviorSubject<number>(0);

    public score$ = this.scoreSubject.asObservable();

    constructor(private http: HttpClient) {}

    public get(moduleId: number): Observable<ModuleProgressDto> {
        return this.http.get<ModuleProgressDto>(`${API}/modules/${moduleId}/user/progress`).pipe(shareReplay(1));
    }

}