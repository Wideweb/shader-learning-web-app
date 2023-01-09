import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressLoad } from 'src/app/features/module-progress/state/module-progress.actions';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { ModuleProgressState } from '../../state/module-progress.state';

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
    this.route.params
      .pipe(
        map(params => params['moduleId']),
        distinctUntilChanged(),
        filter(moduleId => moduleId),
        takeUntil(this.destroy$),
      )
      .subscribe(moduleId => this.store.dispatch(new ModuleProgressLoad(moduleId)))
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
