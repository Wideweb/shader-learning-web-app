import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressState } from '../../module-training-common/state/module-training-common.state';
import { ModuleProgressLoad } from '../../module-training-common/state/module-training-common.actions';
import { AuthState } from '../../auth/state/auth.state';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaskGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);

        const moduleId = Number.parseInt(route.parent!.paramMap.get('moduleId') || '');
        const taskId = Number.parseInt(route.paramMap.get('taskId') || '');

        await firstValueFrom(this.store.dispatch(new ModuleProgressLoad(moduleId, isAuthenticated)));

        const module = this.store.selectSnapshot(ModuleProgressState.module);
        if (!module) {
            return false;
        }

        if (taskId) {
            const task = module?.tasks.find(t => t.id == taskId);
            if (task && !task.locked) {
                return true;
            }
        }

        const finished = this.store.selectSnapshot(ModuleProgressState.finished);
        if (finished) {
            this.router.navigate([`module-training/${module.id}/end`]);
            return false;
        }
            
        const nextTask = module.tasks.find(task => !task.accepted);
        if (nextTask) {
            this.router.navigate([`module-training/${module.id}/task/${nextTask.id}`]);
            return false;
        }

        return false;
    }
}