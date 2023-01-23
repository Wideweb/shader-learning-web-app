import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { combineLatest, distinctUntilChanged, map, Observable, Subject, takeUntil } from 'rxjs';
import { TaskProgressDto } from '../../models/task-progress.model';
import { UserProfileDto } from '../../models/user-profile.model';
import { UserProfileLoad, UserProfileLoadMe } from '../../state/user-profile.actions';
import { UserProfileState } from '../../state/user-profile.state';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  @Select(UserProfileState.me)
  public me$!: Observable<UserProfileDto | null>;
  
  @Select(UserProfileState.userProfile)
  public userProfile$!: Observable<UserProfileDto | null>;

  @Select(UserProfileState.userProgress)
  public userProgress$!: Observable<TaskProgressDto[]>;

  @Select(UserProfileState.userProgressSize)
  public userProgressSize$!: Observable<number>;

  @Select(UserProfileState.loaded)
  public loaded$!: Observable<boolean>;

  public showTaskLink$!: Observable<boolean>;

  public userProfile: UserProfileDto | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        takeUntil(this.destroy$),
      )
      .subscribe(id => this.store.dispatch(id ? new UserProfileLoad(id) : new UserProfileLoadMe()));

    this.userProfile$.pipe(takeUntil(this.destroy$)).subscribe(userProfile => (this.userProfile = userProfile));

    this.showTaskLink$ = combineLatest([this.me$, this.userProfile$])
      .pipe(map(([me, profile]) => !!me && !!profile && me.id == profile.id));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
