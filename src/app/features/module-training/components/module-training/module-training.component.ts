import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, filter, map, Observable, startWith, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleProgressDto } from '../../models/module-progress.model';
import { UserTaskDto, UserTaskSubmissionDto } from '../../models/user-task.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { TaskProgressDto } from '../../models/task-progress.model';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { Location } from '@angular/common';
import { ModuleProgressState, UserShaderProgram } from 'src/app/features/module-training-common/state/module-training-common.state';
import { ModuleProgressLoadNextTask, ModuleProgressLoadTask, ModuleProgressSwitchToNextTask, ModuleProgressSwitchToPrevTask, ModuleProgressUnselectCurrentTask } from 'src/app/features/module-training-common/state/module-training-common.actions';

@Component({
  selector: 'module-training',
  templateUrl: './module-training.component.html',
  styleUrls: ['./module-training.component.scss'],
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

  @Select(ModuleProgressState.isFirstTask)
  public isFirstTask$!: Observable<boolean>;

  @Select(ModuleProgressState.isNextTaskAvailable)
  public isNextTaskAvailable$!: Observable<boolean>;

  public showCongratualtions$!: Observable<boolean>;

  public canEditTask$: Observable<boolean>;

  public module: ModuleProgressDto | null = null;

  public navigationHidden = true;

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
    this.module$.pipe(
      filter(module => !!module),
      takeUntil(this.destroy$)
    ).subscribe(module => (this.module = module));

    this.module$.pipe(
      filter(module => !!module),
      switchMap(() => this.route.params),
      map(params => params['taskId']),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(taskId => {
        const task = this.store.selectSnapshot(ModuleProgressState.module)?.tasks.find(t => t.id == taskId);
        if (!task || task.locked) {
          const finished = this.store.selectSnapshot(ModuleProgressState.finished);
          if (finished) {
            this.router.navigate([`module-training/${this.module!.id}/end`]);
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
        const url = `module-training/${this.module!.id}/task/${userTask.task.id}`;
        this.location.replaceState(url);
        this.router.navigate([url]);
      });

    // combineLatest([this.module$, this.showCongratualtions$])
    //   .pipe(
    //     filter(([module, showCongratualtions]) => !!module && showCongratualtions),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe(([module]) => {
    //     const url = `module-training/${module!.id}/task`;
    //     this.location.replaceState(url);
    //     this.router.navigate([url]);
    //   });
  }

  nextTask() {
    const finished = this.store.selectSnapshot(ModuleProgressState.finished);
    if (finished) {
      this.router.navigate([`module-training/${this.module!.id}/end`]);
    } else {
      this.store.dispatch(new ModuleProgressLoadNextTask());
    }
  }

  switchToNextTask() {
    this.store.dispatch(new ModuleProgressSwitchToNextTask());
  }

  switchToPrevTask() {
    this.store.dispatch(new ModuleProgressSwitchToPrevTask());
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.store.dispatch(new ModuleProgressUnselectCurrentTask());
  }
}
