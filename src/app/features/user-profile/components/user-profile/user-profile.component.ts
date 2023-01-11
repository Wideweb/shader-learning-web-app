import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { distinctUntilChanged, filter, map, Observable, Subject, takeUntil } from 'rxjs';
import { TaskProgressDto } from '../../models/task-progress.model';
import { UserProfileDto } from '../../models/user-profile.model';
import { UserProfileLoad } from '../../state/user-profile.actions';
import { UserProfileState } from '../../state/user-profile.state';

@Component({
  selector: 'user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  
  @Select(UserProfileState.userProfile)
  public userProfile$!: Observable<UserProfileDto | null>;

  @Select(UserProfileState.userProgress)
  public userProgress$!: Observable<TaskProgressDto[]>;

  @Select(UserProfileState.userProgressSize)
  public userProgressSize$!: Observable<number>;

  @Select(UserProfileState.loaded)
  public loaded$!: Observable<boolean>;

  public userProfile: UserProfileDto | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params
      .pipe(
        map(params => params['id']),
        distinctUntilChanged(),
        filter(id => id),
        takeUntil(this.destroy$),
      )
      .subscribe(id => this.store.dispatch(new UserProfileLoad(id)));

    this.userProfile$.pipe(takeUntil(this.destroy$)).subscribe(userProfile => (this.userProfile = userProfile));
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
