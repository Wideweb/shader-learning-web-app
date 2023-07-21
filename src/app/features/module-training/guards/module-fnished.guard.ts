import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, ActivatedRoute} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressState } from '../../module-training-common/state/module-training-common.state';
import { LoadMe } from '../../auth/state/auth.actions';
import { Observable, filter, switchMap, tap } from 'rxjs';
import { AuthState } from '../../auth/state/auth.state';
import { ModuleProgressLoad } from '../../module-training-common/state/module-training-common.actions';

@Injectable()
export class ModuleFinishedGuard implements CanActivate {
  
    constructor(private store: Store, private router: Router, private route: ActivatedRoute){};

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
        return this.store.dispatch(new LoadMe())
            .pipe(
                switchMap(() => this.store.select(AuthState.loaded)),
                filter(loaded => loaded),
                switchMap(() => this.store.select(AuthState.isAuthenticated)),
                switchMap((isAuthenticated) => {
                    const moduleId = Number.parseInt(next.parent!.paramMap.get('moduleId') || '');
                    return this.store.dispatch(new ModuleProgressLoad(moduleId, isAuthenticated));
                }),
                switchMap(() => this.store.select(ModuleProgressState.loaded)),
                filter(loaded => loaded),
                switchMap(() => this.store.select(ModuleProgressState.finished)),
                tap((finished) => {
                    if (!finished) {
                        const module = this.store.selectSnapshot(ModuleProgressState.module);
                        this.router.navigate([`module-training/${module?.id}/task/`])
                    }
                })
            );
    }
}