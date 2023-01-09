import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { TaskProgressDto } from '../../models/task-progress.model';
import { UserProfileLoadProgress } from '../../state/user-profile.actions';
import { UserProfileState } from '../../state/user-profile.state';

@Component({
  selector: 'user-progress',
  templateUrl: './user-progress.component.html',
  styleUrls: ['./user-progress.component.css']
})
export class UserProgressComponent implements AfterViewInit, OnInit, OnDestroy  {
  
  @Select(UserProfileState.userProgress)
  public userProgress$!: Observable<TaskProgressDto[] | null>;

  @Select(UserProfileState.loaded)
  public loaded$!: Observable<boolean>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['name', 'score', 'status'];

  readonly dataSource: MatTableDataSource<TaskProgressDto>;

  readonly destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.store.dispatch(new UserProfileLoadProgress());
    this.userProgress$
      .pipe(
        takeUntil(this.destroy$))
      .subscribe(progress => {
        this.dataSource.data = progress || [];
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
