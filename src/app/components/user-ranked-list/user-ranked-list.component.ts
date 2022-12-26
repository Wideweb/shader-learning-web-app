import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BehaviorSubject } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { UserRankedListDto } from 'src/app/models/user.model';

@Component({
  selector: 'user-ranked-list',
  templateUrl: './user-ranked-list.component.html',
  styleUrls: ['./user-ranked-list.component.css']
})
export class UserRankedListComponent implements OnInit, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly displayedColumns: string[] = ['name', 'rank', 'solved'];

  readonly dataSource: MatTableDataSource<UserRankedListDto>;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private userService: UserService) {
    this.dataSource = new MatTableDataSource([] as any);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.loaded$.next(false);
    this.userService.getRankedList().subscribe(data => {
      this.dataSource.data = data;
      this.loaded$.next(true);
    });
  }
}
