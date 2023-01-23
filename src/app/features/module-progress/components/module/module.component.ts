import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressLoad } from 'src/app/features/module-progress/state/module-progress.actions';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { ModuleProgressState } from '../../state/module-progress.state';
import { AuthState } from 'src/app/features/auth/state/auth.state';

@Component({
  selector: 'module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit, OnDestroy {
  
  @Select(ModuleProgressState.module)
  public module$!: Observable<ModuleProgressDto>;

  @Select(ModuleProgressState.loaded)
  public loaded$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const moduleId$ = this.route.params
      .pipe(
        map(params => params['moduleId']),
        distinctUntilChanged(),
        filter(moduleId => moduleId),
      );

    const isAuthenticated$ = this.store.select(AuthState.isAuthenticated)
      .pipe(distinctUntilChanged());

    combineLatest([moduleId$, isAuthenticated$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([moduleId, isAuth]) => this.store.dispatch(new ModuleProgressLoad(moduleId, isAuth)));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
