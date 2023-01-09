import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngxs/store';
import { ModuleTaskListDto } from '../../../models/module-task-list.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';

@Component({
  selector: 'module-edit-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.css']
})
export class ModuleEditTaskTableComponent implements AfterViewInit, OnChanges {
  @Input()
  public data: ModuleTaskListDto[] = [];

  @Output()
  public onReorderTasks = new EventEmitter<{ oldOrder: number, newOrder: number }>();

  @Output()
  public onEditTask = new EventEmitter<number>();

  @Output()
  public onOpenTask = new EventEmitter<number>();

  @Output()
  public onToggleTaskVisibility = new EventEmitter<number>();

  @ViewChild(MatPaginator)
  public paginator!: MatPaginator;

  public empty = true;

  public readonly displayedColumns: string[] = ['drag', 'order', 'name', 'cost', 'threshold', 'actions'];

  public readonly dataSource: MatTableDataSource<ModuleTaskListDto>;

  public readonly loaded$ = new BehaviorSubject<boolean>(false);

  public readonly canReorder$: Observable<boolean>;

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store) {
    this.dataSource = new MatTableDataSource([] as any);

    this.store.select(AuthState.hasAnyPermissions(['task_edit', 'task_visibility', 'task_delete']))
      .pipe(takeUntil(this.destroy$))
      .subscribe(has => {
      if (has && !this.displayedColumns.includes('actions')) {
        this.displayedColumns.push('actions');
      }

      if (!has && this.displayedColumns.includes('actions')) {
        const index = this.displayedColumns.indexOf('actions');
        if (index > -1) {
          this.displayedColumns.splice(index, 1);
        }
      }
    });

    this.canReorder$ = this.store.select(AuthState.hasAnyPermissions(['task_reorder']));

    this.canReorder$
      .pipe(takeUntil(this.destroy$))
      .subscribe(has => {
        if (has && !this.displayedColumns.includes('drag')) {
          this.displayedColumns.push('drag');
        }

        if (!has && this.displayedColumns.includes('drag')) {
          const index = this.displayedColumns.indexOf('drag');
          if (index > -1) {
            this.displayedColumns.splice(index, 1);
          }
        }
      });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      this.dataSource.data = [...this.data];
      this.empty = !this.data || this.data.length <= 0;
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  toggleTaskVisibility(task: ModuleTaskListDto) {
    this.onToggleTaskVisibility.emit(task.id);
  }

  deleteTask(task: ModuleTaskListDto) {

  }

  onListDrop(event: CdkDragDrop<ModuleTaskListDto[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
    this.onReorderTasks.emit({ oldOrder: event.previousIndex, newOrder: event.currentIndex });
  }

  openTask(task: ModuleTaskListDto) {
    this.onOpenTask.emit(task.id);
  }

  editTask(task: ModuleTaskListDto) {
    this.onEditTask.emit(task.id);
  }
}
