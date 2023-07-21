import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressState } from 'src/app/features/module-training-common/state/module-training-common.state';
import { ModuleProgressUnselectCurrentTask } from 'src/app/features/module-training-common/state/module-training-common.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { Location } from '@angular/common';
import { ModuleProgressDto } from 'src/app/features/module-training-common/models/module-progress.model';
import { UserTaskDto } from 'src/app/features/module-training-common/models/user-task.model';
import { TaskProgressDto } from 'src/app/features/module-training-common/models/task-progress.model';

@Component({
  selector: 'module',
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent implements OnInit, OnDestroy {
  
  @Select(ModuleProgressState.module)
  public module$!: Observable<ModuleProgressDto>;

  @Select(ModuleProgressState.moduleName)
  public moduleName$!: Observable<string>;

  @Select(ModuleProgressState.userTask)
  public userTask$!: Observable<UserTaskDto>;

  @Select(ModuleProgressState.tasks)
  public tasks$!: Observable<TaskProgressDto[]>;

  @Select(ModuleProgressState.task)
  public task$!: Observable<TaskProgressDto>;

  @Select(ModuleProgressState.loaded)
  public loaded$!: Observable<boolean>;

  public navigationHidden = true;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private pageMeta: PageMetaService,
    private router: Router,
    private location: Location,
  ) {
    this.moduleName$
      .pipe(
        filter(moduleName => !!moduleName),
        takeUntil(this.destroy$),
      )
      .subscribe(moduleName => this.pageMeta.setTitle(moduleName));
  }

  ngOnInit(): void {
      this.userTask$
        .pipe(
          distinctUntilChanged((o, n) => o?.task?.id === n?.task?.id),
          filter(task => !!task),
          takeUntil(this.destroy$),
        )
        .subscribe(userTask => {
          const module = this.store.selectSnapshot(ModuleProgressState.module);
          const url = `module-training/${module!.id}/task/${userTask.task.id}`;
          this.location.replaceState(url);
          this.router.navigate([url]);
        });
  }

  selectedTaskId() {
    return this.route.snapshot.params['taskId'];
  }

  showNavigation() {
    this.navigationHidden = false;
  }

  closeNavigation() {
    this.navigationHidden = true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.store.dispatch(new ModuleProgressUnselectCurrentTask());
  }
}
