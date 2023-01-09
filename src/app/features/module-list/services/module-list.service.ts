import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleListDto } from '../models/module-list.model';

@Injectable({
  providedIn: 'root',
})
export class ModuleListService {

    constructor(private http: HttpClient) {}

    public load(): Observable<ModuleListDto[]> {
        return this.http.get<ModuleListDto[]>(`${API}/modules/list`).pipe(shareReplay(1));
    }

}