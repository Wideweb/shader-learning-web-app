import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { TaskProgressDto } from '../../../models/task-progress.model';

@Component({
  selector: 'moduel-view-task-table',
  templateUrl: './task-table.component.html',
  styleUrls: ['./task-table.component.css']
})
export class ModuleViewTaskTableComponent implements AfterViewInit, OnChanges {
  @Input()
  public data: TaskProgressDto[] = [];

  @Output()
  public onReorderTasks = new EventEmitter<{ oldOrder: number, newOrder: number }>();

  @Output()
  public onEditTask = new EventEmitter<number>();

  @Output()
  public onOpenTask = new EventEmitter<number>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public empty = true;

  readonly displayedColumns: string[] = ['name', 'status', 'match', 'score'];

  readonly dataSource: MatTableDataSource<TaskProgressDto>;

  constructor() {
    this.dataSource = new MatTableDataSource([] as any);
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

  openTask(task: TaskProgressDto) {
    this.onOpenTask.emit(task.id);
  }
}
