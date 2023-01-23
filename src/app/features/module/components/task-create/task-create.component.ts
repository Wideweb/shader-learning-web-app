import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { TaskState } from '../../state/task.state';
import { distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';
import { TaskLoad, TaskNew } from '../../state/task.actions';
import { TaskDto } from '../../models/task.model';
import { ModuleState } from '../../state/module.state';
import { TaskCreateFormComponent } from './task-create-form/task-create-form.component';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent implements OnInit, OnDestroy {
  
  @Select(ModuleState.currentId)
  public moduleId$!: Observable<number>;

  @Select(TaskState.current)
  public task$!: Observable<TaskDto>;

  @ViewChild(TaskCreateFormComponent)
  public taskCreateFormComponent!: TaskCreateFormComponent;

  public isNew$!: Observable<boolean>;

  public isEdit$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute, private pageMeta: PageMetaService) {
    this.isNew$= this.route.params.pipe(map(params => !params['taskId']));
    this.isEdit$ = this.route.params.pipe(map(params => !!params['taskId']));
  }

  ngOnInit(): void {
    this.pageMeta.setDefaultDescription();

    this.route.params
      .pipe(
        map(params => params['taskId']),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(taskId => {
        this.store.dispatch(taskId ? new TaskLoad(taskId) : new TaskNew());
        this.pageMeta.setTitle(taskId ? 'Edit Task' : 'Create Task');
        this.pageMeta.setDefaultDescription();
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  save() {
    this.taskCreateFormComponent.save();
  }

  cancel() {
    this.taskCreateFormComponent.cancel();
  }
}
