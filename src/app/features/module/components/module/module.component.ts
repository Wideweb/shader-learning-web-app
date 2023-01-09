import { Component, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleState } from '../../state/module.state';
import { ModuleDto } from '../../models/module.model';
import { ModuleLoad } from '../../state/module.actions';

@Component({
  selector: 'module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.css']
})
export class ModuleComponent implements OnInit, OnDestroy {
  
  @Select(ModuleState.current)
  public module$!: Observable<ModuleDto>;

  @Select(ModuleState.loaded)
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
      .subscribe(moduleId => this.store.dispatch(new ModuleLoad(moduleId)))
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
