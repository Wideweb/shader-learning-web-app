import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Select, Store } from '@ngxs/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { UserRankListDto } from '../../models/user-rank-list.model';
import { UserRankListLoad } from '../../state/user-rank-list.actions';
import { UserRankListState } from '../../state/user-rank-list.state';

@Component({
  selector: 'user-ranked-list',
  templateUrl: './user-ranked-list.component.html',
  styleUrls: ['./user-ranked-list.component.css']
})
export class UserRankedListComponent implements OnInit, AfterViewInit {
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Select(UserRankListState.list)
  public data$!: Observable<UserRankListDto[]>;

  @Select(UserRankListState.loaded)
  public loaded$!: Observable<boolean>; 

  readonly displayedColumns: string[] = ['name', 'rank', 'solved'];

  readonly dataSource: MatTableDataSource<UserRankListDto>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private pageMeta: PageMetaService) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.data$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => (this.dataSource.data = data));

    this.store.dispatch(new UserRankListLoad());

    this.pageMeta.setTitle('User Rating');
    this.pageMeta.setDescription(`View user rating on Shader Learning, the best platform to improve your shading skill.`);
  }
}
