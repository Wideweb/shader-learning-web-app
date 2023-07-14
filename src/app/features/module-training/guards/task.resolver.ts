import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot} from '@angular/router';
import { Store } from '@ngxs/store';
import { ModuleProgressLoadTask } from '../../module-training-common/state/module-training-common.actions';
import { Observable, filter, switchMap } from 'rxjs';
import { ModuleProgressState } from '../../module-training-common/state/module-training-common.state';

@Injectable()
export class TaskResovler implements Resolve<Observable<void>> {
  
    constructor(private store: Store){};

    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        const taskId = Number.parseInt(route.paramMap.get('taskId') || '');
        return this.store.dispatch(new ModuleProgressLoadTask(taskId))
            .pipe(
                switchMap(() => this.store.select(ModuleProgressState.userTaskLoaded)),
                filter(loaded => loaded),
            );
    }
}