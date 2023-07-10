import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressState } from '../../module-training-common/state/module-training-common.state';

@Injectable()
export class ModuleFinishedGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const module = this.store.selectSnapshot(ModuleProgressState.module);
        if (!module) {
            return false;
        }

        const isFinished = this.store.selectSnapshot(ModuleProgressState.finished);
        if (isFinished) {
            return true;
        }

        this.router.navigate([`module-training/${module.id}/task/`]);
        return false;
    }
}