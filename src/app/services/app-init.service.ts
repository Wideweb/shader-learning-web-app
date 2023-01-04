import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  constructor(private auth: AuthService) { }

  public init(): Observable<any> {
    return forkJoin([
      this.auth.updateMe().pipe(catchError(error => of(error))),
    ]);
  }
}