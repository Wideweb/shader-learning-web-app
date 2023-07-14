import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';
import { filter, firstValueFrom } from 'rxjs';
import { LoadMe } from '../state/auth.actions';

@Injectable()
export class AuthGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    async canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        await firstValueFrom(this.store.dispatch(new LoadMe()));
        await firstValueFrom(this.store.select(AuthState.loaded).pipe(filter(v => v)));

        const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
        if (!isAuthenticated) {
            this.router.navigate(['/login', {returnUrl: state.url}]);
            return false;
        }

        const routePermissions = next.data?.['permissions'] || [];
        const hasPermission = this.store.selectSnapshot(AuthState.hasAllPermissions(routePermissions));

        if (!hasPermission) {
            console.error('unauthorized');
            this.router.navigate(['/403']);
            return false;
        }
        
        
        return true;
    }
}