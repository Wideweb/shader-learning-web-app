import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  constructor(private auth: AuthService) { }

  public hasAny(permissions: string[]): boolean {
    const userPermissions = this.auth.me?.permissions || [];
    const has = permissions.some(p => userPermissions.some(up => p.toLowerCase() == up.toLowerCase()));
    return has;
  }

  public hasAny$(permissions: string[]): Observable<boolean> {
    return this.auth.me$.pipe(map(me => {
      const userPermissions = me?.permissions || [];
      const has = permissions.some(p => userPermissions.some(up => p.toLowerCase() == up.toLowerCase()));
      return has;
    }));
  }

  public hasAll(permissions: string[]): boolean {
    const userPermissions = this.auth.me?.permissions || [];
    const has = permissions.every(p => userPermissions.some(up => p.toLowerCase() == up.toLowerCase()));
    return has;
  }

  public hasAll$(permissions: string[]): Observable<boolean> {
    return this.auth.me$.pipe(map(me => {
      const userPermissions = me?.permissions || [];
      const has = permissions.every(p => userPermissions.some(up => p.toLowerCase() == up.toLowerCase()));
      return has;
    }));
  }
}