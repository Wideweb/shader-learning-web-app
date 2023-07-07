import { Component, OnDestroy, OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, Observable, pairwise, Subject, takeUntil } from 'rxjs';
import { LoadMe } from 'src/app/features/auth/state/auth.actions';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { PageMetaService } from 'src/app/features/common/services/page-meta.service';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';
import { UserProfileLoadMe } from 'src/app/features/user-profile/state/user-profile.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(
    public spinner: SpinnerService,
    private store: Store,
    private title: Title,
    private meta: Meta,
    private pageMetaService: PageMetaService,
    private router: Router,
  ) {
    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      pairwise(),
      filter(([prev, curr]) => !curr && prev != curr),
      takeUntil(this.destroy$),
    ).subscribe(() => this.router.navigateByUrl('/'));

    this.isAuthenticated$.pipe(
      distinctUntilChanged(),
      filter(isAuthenticated => isAuthenticated),
      takeUntil(this.destroy$),
    ).subscribe(() =>  this.store.dispatch([new UserProfileLoadMe(), new LoadMe()]));

    this.pageMetaService.title$
      .pipe(takeUntil(this.destroy$))
      .subscribe(title => this.title.setTitle(title));

    this.pageMetaService.description$
      .pipe(takeUntil(this.destroy$))
      .subscribe(description => this.meta.updateTag({ name: 'description', content: description }));
  }
  
  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
