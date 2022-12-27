import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(private auth: AuthService) { }

  public init(): Observable<any> {
    return forkJoin([
      this.auth.updateMe(),
    ]);
  }
}