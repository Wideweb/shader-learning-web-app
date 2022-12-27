import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PermissionService } from '../services/permission.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
    constructor(private authService: AuthService, private permissions: PermissionService, private router: Router){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let isLoggedIn = this.authService.isLoggedIn();
        if (!isLoggedIn) {
            this.router.navigate(['/login', {returnUrl: state.url}]);
            return false;
        }

        const routePermissions = next.data?.['permissions'] || [];
        if (!this.permissions.hasAll(routePermissions)) {
            console.error('unauthorized');
            this.router.navigate(['/403']);
            return false;
        }
        
        
        return true;
    }
}