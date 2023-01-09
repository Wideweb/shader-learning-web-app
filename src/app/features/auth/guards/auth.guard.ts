import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

@Injectable()
export class AuthGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
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