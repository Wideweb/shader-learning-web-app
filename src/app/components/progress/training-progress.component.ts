import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { TaskService } from 'src/app/services/task.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { UserTaskResultDto } from 'src/app/models/task.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'training-progress',
  templateUrl: './training-progress.component.html',
  styleUrls: ['./training-progress.component.css']
})
export class TrainingProgressComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['name', 'score', 'status'];

  readonly dataSource: MatTableDataSource<UserTaskResultDto>;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private taskService: TaskService,) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loaded$.next(false);
    this.taskService.getProgress().subscribe(data => {
      this.dataSource.data = data;
      this.loaded$.next(true);
    })
  }
}
