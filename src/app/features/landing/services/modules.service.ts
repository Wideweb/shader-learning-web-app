import { Injectable } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { API } from 'src/environments/environment';
import { ModuleDto } from '../models/module.model';
import { CANCEL_SPINNER_TOKEN } from '../../common/interceptors/spinner.interceptor';

@Injectable({
  providedIn: 'root',
})
export class ModulesService {

    constructor(private http: HttpClient) {}

    public load(): Observable<ModuleDto[]> {
      return this.http.get<ModuleDto[]>(`${API}/modules/list`, {
        context: new HttpContext().set(CANCEL_SPINNER_TOKEN, true)
      }).pipe(shareReplay(1));
    }
}