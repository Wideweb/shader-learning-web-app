import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TaskListDto } from 'src/app/models/task.model';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Store } from '@ngxs/store';
import { AuthState } from 'src/app/states/auth.state';

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public readonly displayedColumns: string[] = ['drag', 'order', 'name', 'cost', 'threshold', 'actions'];

  public readonly dataSource: MatTableDataSource<TaskListDto>;

  public readonly loaded$ = new BehaviorSubject<boolean>(false);

  private readonly destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private taskService: TaskService, private store: Store) {
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
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  load() {
    this.loaded$.next(false);
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
  }
}
