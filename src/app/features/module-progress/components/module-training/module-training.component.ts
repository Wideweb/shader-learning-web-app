import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, filter, map, Observable, startWith, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressState } from '../../state/module-progress.state';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { UserTaskDto } from '../../models/user-task.model';
import { ModuleProgressLoadNextTask, ModuleProgressLoadTask } from '../../state/module-progress.actions';
import { AuthState } from 'src/app/features/auth/state/auth.state';

@Component({
  selector: 'module-training',
  templateUrl: './module-training.component.html',
  styleUrls: ['./module-training.component.css']
})
export class ModuleTrainingComponent implements OnInit, OnDestroy {

  @Select(ModuleProgressState.module)
  public module$!: Observable<ModuleProgressDto>;

  @Select(ModuleProgressState.loaded)
  public loaded$!: Observable<boolean>;

  @Select(ModuleProgressState.userTask)
  public userTask$!: Observable<UserTaskDto>;

  @Select(ModuleProgressState.userTaskLoaded)
  public userTaskLoaded$!: Observable<boolean>;

  @Select(ModuleProgressState.finished)
  public finished$!: Observable<boolean>;

  public canEditTask$: Observable<boolean>;

  public module: ModuleProgressDto | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute, private router: Router) {
    const hasEditTaskPermission$ = this.store.select(AuthState.hasAllPermissions(['task_edit']));
    const hasEditAllTasksPermission$ = this.store.select(AuthState.hasAllPermissions(['task_edit_all']));

    const isOwner$ = combineLatest([this.store.select(AuthState.user), this.userTask$])
      .pipe(
        map(([user, userTask]) => user?.id == userTask?.task?.createdBy?.id)
      );

    this.canEditTask$ = combineLatest([isOwner$, hasEditTaskPermission$, hasEditAllTasksPermission$])
      .pipe(
        map(([isOwner, canEditTask, canEditAllTasks]) => (isOwner && canEditTask) || canEditAllTasks),
        startWith(false)
      );
  }

  ngOnInit(): void {
    this.module$.pipe(takeUntil(this.destroy$)).subscribe(module => (this.module = module));

    this.route.params
      .pipe(
        map(params => params['taskId']),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(taskId => {
        const action = taskId ? new ModuleProgressLoadTask(taskId) : new ModuleProgressLoadNextTask();
        this.store.dispatch(action);
      });

    this.userTask$
      .pipe(
        filter(task => !!task),
        distinctUntilChanged((o, n) => o?.task?.id === n?.task?.id),
        takeUntil(this.destroy$),
      )
      .subscribe(userTask => {
        this.router.navigate([`module-progress/${this.module!.id}/training/${userTask.task.id}`])
      });
  }

  nextTask() {
    this.store.dispatch(new ModuleProgressLoadNextTask());
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
