import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressState } from '../../module-training-common/state/module-training-common.state';
import { ModuleProgressLoad } from '../../module-training-common/state/module-training-common.actions';
import { AuthState } from '../../auth/state/auth.state';
import { Observable, filter, map, switchMap } from 'rxjs';
import { LoadMe } from '../../auth/state/auth.actions';

@Injectable()
export class TaskGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router){};

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.store.dispatch(new LoadMe())
            .pipe(
                switchMap(() => this.store.select(AuthState.loaded)),
                filter(loaded => loaded),
                switchMap(() => this.store.select(AuthState.isAuthenticated)),
                switchMap((isAuthenticated) => {
                    const moduleId = Number.parseInt(route.parent!.paramMap.get('moduleId') || '');
                    return this.store.dispatch(new ModuleProgressLoad(moduleId, isAuthenticated));
                }),
                switchMap(() => this.store.select(ModuleProgressState.loaded)),
                filter(loaded => loaded),
                map(() => {
                    const module = this.store.selectSnapshot(ModuleProgressState.module);
                    if (!module) {
                        this.router.navigate([`/explore`]);
                        return false;
                    }

                    const taskId = Number.parseInt(route.paramMap.get('taskId') || '');
                    const task = module?.tasks.find(t => t.id == taskId);
                    if (task && !task.locked) {
                        return true;
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
                    
                    this.router.navigate([`module-view/${module.id}`]);
                    return false;
                })
            );
    }
}