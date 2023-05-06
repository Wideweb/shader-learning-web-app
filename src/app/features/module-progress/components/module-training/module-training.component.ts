import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, filter, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressState, UserShaderProgram } from '../../state/module-progress.state';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { UserTaskDto, UserTaskSubmissionDto } from '../../models/user-task.model';
import { ModuleProgressLoadNextTask, ModuleProgressLoadTask, ModuleProgressUnselectCurrentTask } from '../../state/module-progress.actions';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { TaskProgressDto } from '../../models/task-progress.model';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { Location } from '@angular/common';

@Component({
  selector: 'module-training',
  templateUrl: './module-training.component.html',
  styleUrls: ['./module-training.component.css'],
})
export class ModuleTrainingComponent implements OnInit, OnDestroy {

  @Select(ModuleProgressState.module)
  public module$!: Observable<ModuleProgressDto>;

  @Select(ModuleProgressState.moduleName)
  public moduleName$!: Observable<string>;

  @Select(ModuleProgressState.acceptetTasksRate)
  public acceptetTasksRate$!: Observable<number>;

  @Select(ModuleProgressState.tasks)
  public tasks$!: Observable<TaskProgressDto[]>;

  @Select(ModuleProgressState.loaded)
  public loaded$!: Observable<boolean>;

  @Select(ModuleProgressState.userTask)
  public userTask$!: Observable<UserTaskDto>;
  
  @Select(ModuleProgressState.userShaderProgram)
  public userShaderProgram$!: Observable<UserShaderProgram>;

  @Select(ModuleProgressState.userTaskSubmissions)
  public userTaskSubmissions$!: Observable<UserTaskSubmissionDto[]>;

  @Select(ModuleProgressState.userTaskLoaded)
  public userTaskLoaded$!: Observable<boolean>;

  @Select(ModuleProgressState.userTaskLoading)
  public userTaskLoading$!: Observable<boolean>;

  @Select(ModuleProgressState.finished)
  public finished$!: Observable<boolean>;

  public showCongratualtions$!: Observable<boolean>;

  public canEditTask$: Observable<boolean>;

  public module: ModuleProgressDto | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private pageMeta: PageMetaService,
    private location: Location,
  ) {
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

    combineLatest([this.moduleName$, this.userTask$])
      .pipe(
        filter(([moduleName, userTask]) => !!moduleName && !!userTask),
        takeUntil(this.destroy$),
      )
      .subscribe(([moduleName, userTask]) => this.pageMeta.setTitle(`${moduleName} | ${userTask.task.name}`));

    this.showCongratualtions$ = combineLatest([this.userTaskLoading$, this.userTaskLoaded$, this.finished$])
      .pipe(
        map(([userTaskLoading, userTaskLoaded, finished]) => !userTaskLoading && !userTaskLoaded && finished),
      );
  }

  ngOnInit(): void {
    this.module$.pipe(takeUntil(this.destroy$)).subscribe(module => (this.module = module));

    this.module$.pipe(
      switchMap(() => this.route.params),
      map(params => params['taskId']),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(taskId => {
        const task = this.store.selectSnapshot(ModuleProgressState.module)?.tasks.find(t => t.id == taskId);
        if (!task || task.locked) {
          const finished = this.store.selectSnapshot(ModuleProgressState.finished);
          if (finished) {
            return;
          }

          this.store.dispatch(new ModuleProgressLoadNextTask());
          return;
        }
        this.store.dispatch(new ModuleProgressLoadTask(taskId));
      });

    this.userTask$
      .pipe(
        distinctUntilChanged((o, n) => o?.task?.id === n?.task?.id),
        filter(task => !!task),
        takeUntil(this.destroy$),
      )
      .subscribe(userTask => {
        const url = `module-progress/${this.module!.id}/training/${userTask.task.id}`;
        this.location.replaceState(url);
        this.router.navigate([url]);
      });

    combineLatest([this.module$, this.showCongratualtions$])
      .pipe(
        filter(([module, showCongratualtions]) => !!module && showCongratualtions),
        takeUntil(this.destroy$),
      )
      .subscribe(([module]) => {
        const url = `module-progress/${module!.id}/training`;
        this.location.replaceState(url);
        this.router.navigate([url]);
      });
  }

  nextTask() {
    this.store.dispatch(new ModuleProgressLoadNextTask());
  }

  selectedTaskId() {
    return this.route.snapshot.params['taskId'];
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.store.dispatch(new ModuleProgressUnselectCurrentTask());
  }
}
