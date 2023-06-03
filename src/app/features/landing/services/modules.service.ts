import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleDto } from '../../module/models/module.model';

@Injectable({
  providedIn: 'root',
})
export class ModulesService {

    constructor(private http: HttpClient) {}

    public load(): Observable<ModuleDto[]> {
        return this.http.get<ModuleDto[]>(`${API}/modules/list`).pipe(shareReplay(1));
    }
}