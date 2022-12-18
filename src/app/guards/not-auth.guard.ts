import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class NotAuthGuard implements CanActivate {
  
    constructor(private authService: AuthService, private router: Router){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        let isLoggedOut = this.authService.isLoggedOut();
        if (isLoggedOut) {
            return true;
        }

        this.router.navigate(['/']);
        return false;
    }
}