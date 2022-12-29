import { AfterViewInit, Component, EventEmitter, Input, Output, SimpleChange, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserTaskResultDto } from 'src/app/models/task.model';

@Component({
  selector: 'moduel-view-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.css']
})
export class ModuleViewTaskTableComponent implements AfterViewInit {
  @Input()
  public data: UserTaskResultDto[] = [];

  @Output()
  public onReorderTasks = new EventEmitter<{ oldOrder: number, newOrder: number }>();

  @Output()
  public onEditTask = new EventEmitter<number>();

  @Output()
  public onOpenTask = new EventEmitter<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['name', 'status', 'match', 'score'];

  readonly dataSource: MatTableDataSource<UserTaskResultDto>;

  constructor() {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChange): void {
    if ('data' in changes) {
      this.dataSource.data = [...this.data];
    }
  }

  openTask(task: UserTaskResultDto) {
    this.onOpenTask.emit(task.id);
  }
}
