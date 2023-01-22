import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleProgressDto } from '../models/module-progress.model';
import { ModuleDto } from '../models/module.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleProgressService {

    constructor(private http: HttpClient) {}

    public getUserProgress(moduleId: number): Observable<ModuleProgressDto> {
        return this.http.get<ModuleProgressDto>(`${API}/modules/${moduleId}/user/progress`).pipe(shareReplay(1));
    }

    public get(moduleId: number): Observable<ModuleDto> {
      return this.http.get<ModuleDto>(`${API}/modules/${moduleId}/get`).pipe(shareReplay(1));
  }

}