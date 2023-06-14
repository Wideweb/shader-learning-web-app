import { Component, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { ModuleState } from '../../state/module.state';
import { ModuleDto } from '../../models/module.model';
import { ModuleLoad, ModuleTaskReorder, ModuleTaskToggleVisibility, ModuleToggleLock, ModuleUpdateCover, ModuleUpdateDescription, ModuleUpdateName } from '../../state/module.actions';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';

@Component({
  selector: 'module-edit',
  templateUrl: './module-edit.component.html',
  styleUrls: ['./module-edit.component.css']
})
export class ModuleEditComponent implements OnInit, OnDestroy {
  
  @Select(ModuleState.current)
  public module$!: Observable<ModuleDto>;

  @Select(ModuleState.error)
  public error$!: Observable<any>;

  @Select(ModuleState.nameEdit)
  public nameEdit$!: Observable<boolean>;

  @Select(ModuleState.descriptionEdit)
  public descriptionEdit$!: Observable<boolean>;

  @Select(ModuleState.loaded)
  public loaded$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute, private router: Router, private pageMeta: PageMetaService) { }

  ngOnInit(): void {
    this.pageMeta.setTitle('Edit Module');
    this.pageMeta.setDefaultDescription();

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

  saveModuleName(name: string) {
    this.store.dispatch(new ModuleUpdateName(name));
  }

  saveModuleDescription(description: string) {
    this.store.dispatch(new ModuleUpdateDescription(description));
  }

  saveModuleCover(file: File) {
    this.store.dispatch(new ModuleUpdateCover(file));
  }

  toggleLock() {
    this.store.dispatch(new ModuleToggleLock());
  }

  addTask() {
    this.router.navigate([`../task-create`], { relativeTo: this.route });
  }

  reorderTasks(event: { oldOrder: number, newOrder: number }) {
    this.store.dispatch(new ModuleTaskReorder(event));
  }

  editTask(taskId: number) {
    const moduleId = this.store.selectSnapshot(ModuleState.currentId);
    this.router.navigate([`module/${moduleId}/task/${taskId}/edit`]);
  }

  toggleTaskVisibility(taskId: number) {
    this.store.dispatch(new ModuleTaskToggleVisibility(taskId));
  }

  // save() {
  //   const moduleId = this.store.selectSnapshot(ModuleState.currentId);
  //   this.router.navigate([`module-progress/${moduleId}/view`]);
  // }

  // cancel() {
  //   const moduleId = this.store.selectSnapshot(ModuleState.currentId);
  //   this.router.navigate([`module-progress/${moduleId}/view`]);
  // }
}
