import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, combineLatest, filter, map, takeUntil } from 'rxjs';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { UserRatingTaskDto } from '../../models/user-rating-task.model';
import { UserRatingState } from '../../state/user-rating.state';
import { UserRatingLoad } from '../../state/user-rating.actions';
import { ActivatedRoute } from '@angular/router';
import { UserRatingDto } from '../../models/user-rating.model';

@Component({
  selector: 'user-rating',
  templateUrl: './user-rating.component.html',
  styleUrls: ['./user-rating.component.scss']
})
export class UserRatingComponent implements OnInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @ViewChild('table') tableEl!: ElementRef;

  @Select(UserRatingState.user)
  public user$!: Observable<UserRatingDto>;

  @Select(UserRatingState.userName)
  public userName$!: Observable<string>;

  @Select(UserRatingState.userScore)
  public userScore$!: Observable<number>;

  @Select(UserRatingState.userSumbissions)
  public userSumbissions$!: Observable<number>;

  @Select(UserRatingState.userAcceptions)
  public userAcceptions$!: Observable<number>;

  @Select(UserRatingState.userTasks)
  public tasks$!: Observable<UserRatingTaskDto[]>;

  @Select(UserRatingState.hasTasks)
  public hasTasks$!: Observable<boolean>;

  @Select(UserRatingState.loaded)
  public loaded$!: Observable<boolean>; 

  readonly displayedColumns: string[] = ['task', 'score', 'status'];

  readonly dataSource: MatTableDataSource<UserRatingTaskDto>;

  public tableReady = false;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private pageMeta: PageMetaService, private route: ActivatedRoute) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize();
  }

  ngOnInit(): void {
    combineLatest([this.tasks$, this.loaded$])
      .pipe(
        filter(([_, loaded]) => loaded),
        takeUntil(this.destroy$)
      )
      .subscribe(([data]) => {
        this.dataSource.data = data;
        this.resize();
      });

    this.route.params
      .pipe(
        map(params => params['userId']),
        filter(id => !!id),
        takeUntil(this.destroy$)
      )
      .subscribe(userId => this.store.dispatch(new UserRatingLoad(userId)));

    this.pageMeta.setTitle('User Rating');
    this.pageMeta.setDescription(`View user rating on Shader Learning, the best platform to improve your shading skill.`);
  }

  resize() {
    if (!this.paginator || !this.tableEl) {
      setTimeout(() => this.resize(), 100);
      return;
    }

    const headerSize = 50;
    const rowSize = 50;

    let pages = 10;
    if (window.innerWidth >= 640) {
      pages = (this.tableEl.nativeElement.clientHeight - headerSize) / rowSize;
    }

    this.paginator.length
    this.paginator.pageIndex;
    this.paginator.pageSize = Math.floor(pages);
  
    this.dataSource.paginator = this.paginator;
    this.dataSource.data = [...this.dataSource.data];

    this.tableReady = true;
  }

  get length(): number {
    if (!this.paginator) {
      return 0;
    }

    return this.paginator.length;
  }

  get pageFrom(): number {
    if (!this.paginator) {
      return 0;
    }

    return this.paginator.pageIndex * this.paginator.pageSize + 1;
  }

  get pageTo(): number {
    if (!this.paginator) {
      return 0;
    }

    const to = this.paginator.pageIndex * this.paginator.pageSize + this.paginator.pageSize;
    return Math.min(to, this.paginator.length);
  }

  get isFirstPage(): boolean {
    return this.paginator && this.paginator.pageIndex === 0;
  }

  get isLastPage(): boolean {
    return this.paginator && this.pageTo === this.paginator.length;
  }

  nextPage(): void {
    if (this.isLastPage) {
      return;
    }

    this.paginator.nextPage();
  }
  
  previousPage(): void {
    if (this.isFirstPage) {
      return;
    }

    this.paginator.previousPage();
  }
}
