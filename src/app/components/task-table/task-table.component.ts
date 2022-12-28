import { AfterViewInit, Component, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TaskListDto } from 'src/app/models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { PermissionService } from 'src/app/services/permission.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.css']
})
export class TaskTableComponent implements AfterViewInit {
  @Input()
  public data: TaskListDto[] = [];

  @Output()
  public onReorderTasks = new EventEmitter<{ oldOrder: number, newOrder: number }>();

  @Output()
  public onEditTask = new EventEmitter<number>();

  @Output()
  public onOpenTask = new EventEmitter<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['drag', 'order', 'name', 'cost', 'threshold', 'actions'];

  readonly dataSource: MatTableDataSource<TaskListDto>;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  readonly canReorder$: Observable<boolean>;

  constructor(private taskService: TaskService, private permissions: PermissionService) {
    this.dataSource = new MatTableDataSource([] as any);

    this.permissions.hasAny$(['task_edit', 'task_visibility', 'task_delete']).subscribe(has => {
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

    this.canReorder$ = this.permissions.hasAny$(['task_reorder'])
    this.canReorder$.subscribe(has => {
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

  ngOnChanges(changes: SimpleChange): void {
    if ('data' in changes) {
      this.dataSource.data = [...this.data];
    }
  }

  toggleTaskVisibility(task: TaskListDto) {
    this.taskService.toggleVisibility(task.id).subscribe(visibility => (task.visibility = visibility));
  }

  deleteTask(task: TaskListDto) {

  }

  onListDrop(event: CdkDragDrop<TaskListDto[]>) {
    if (event.previousIndex === event.currentIndex) {
      return;
    }

  moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
    this.dataSource.data = [...this.dataSource.data];
    this.onReorderTasks.emit({ oldOrder: event.previousIndex, newOrder: event.currentIndex });
  }

  openTask(task: TaskListDto) {
    this.onOpenTask.emit(task.id);
  }

  editTask(task: TaskListDto) {
    this.onEditTask.emit(task.id);
  }
}
