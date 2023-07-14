import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressLoad } from '../../module-training-common/state/module-training-common.actions';
import { Observable, filter, firstValueFrom, switchMap } from 'rxjs';
import { AuthState } from '../../auth/state/auth.state';
import { LoadMe } from '../../auth/state/auth.actions';

@Injectable()
export class ModuleResovler implements Resolve<Observable<void>> {
  
    constructor(private store: Store){};

    resolve(route: ActivatedRouteSnapshot): Observable<void> {
        return this.store.dispatch(new LoadMe())
            .pipe(
                switchMap(() => this.store.select(AuthState.loaded)),
                filter(loaded => loaded),
                switchMap(() => this.store.select(AuthState.isAuthenticated)),
                switchMap((isAuthenticated) => {
                    const moduleId = Number.parseInt(route.paramMap.get('moduleId') || '');
                    return this.store.dispatch(new ModuleProgressLoad(moduleId, isAuthenticated));
                }),
                filter(loaded => loaded),
            );
    }
}