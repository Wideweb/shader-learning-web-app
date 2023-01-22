import { AfterViewInit, Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngxs/store';
import { Subject } from 'rxjs';
import { TaskProgressDto } from '../../models/task-progress.model';

@Component({
  selector: 'user-progress',
  templateUrl: './user-progress.component.html',
  styleUrls: ['./user-progress.component.css']
})
export class UserProgressComponent implements AfterViewInit, OnInit, OnChanges  {
  @Input()
  public data: TaskProgressDto[] = [];

  @Input()
  public showTaskLink: boolean = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  public displayedColumns: string[] = ['task', 'score', 'status'];

  readonly dataSource: MatTableDataSource<TaskProgressDto>;

  readonly destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
      this.dataSource.data = this.data || [];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('data' in changes) {
      this.dataSource.data = this.data || [];
    }

    if ('showTaskLink' in changes) {
      this.displayedColumns = [this.showTaskLink ? 'task-link' : 'task', 'score', 'status']
    }
  }
}
