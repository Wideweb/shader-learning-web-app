import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../state/auth.state';

@Injectable()
export class NotAuthGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
        if (!isAuthenticated) {
            return true;
        }

        this.router.navigate(['/']);
        return false;
    }
}