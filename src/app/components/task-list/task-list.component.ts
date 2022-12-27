import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TaskListDto } from 'src/app/models/task.model';
import { BehaviorSubject } from 'rxjs';
import { PermissionService } from 'src/app/services/permission.service';

@Component({
  selector: 'task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['order', 'name', 'cost', 'threshold', 'actions'];

  readonly dataSource: MatTableDataSource<TaskListDto>;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

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
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loaded$.next(false);
    this.taskService.list().subscribe(data => {
      this.dataSource.data = data;
      this.loaded$.next(true);
    });
  }

  toggleTaskVisibility(task: TaskListDto) {
    this.taskService.toggleVisibility(task.id).subscribe(visibility => (task.visibility = visibility));
  }

  deleteTask(task: TaskListDto) {

  }
}