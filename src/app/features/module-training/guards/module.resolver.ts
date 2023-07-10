import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressLoad } from '../../module-training-common/state/module-training-common.actions';
import { Observable } from 'rxjs';
import { AuthState } from '../../auth/state/auth.state';

@Injectable()
export class ModuleResovler implements Resolve<Observable<void>> {
  
    constructor(private store: Store){};

    resolve(route: ActivatedRouteSnapshot): Observable<void> {
        const isAuthenticated = this.store.selectSnapshot(AuthState.isAuthenticated);
        const moduleId = Number.parseInt(route.paramMap.get('moduleId') || '');

        return this.store.dispatch(new ModuleProgressLoad(moduleId, isAuthenticated));
    }
}