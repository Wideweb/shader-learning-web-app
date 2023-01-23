import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { map, Observable, Subject } from 'rxjs';
import { UserDto } from 'src/app/features/auth/models/user.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { UserProfileState } from 'src/app/features/user-profile/state/user-profile.state';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class AppLayoutComponent {
  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  @Select(UserProfileState.meRank)
  public userRank$!: Observable<number>;

  @Select(AuthState.user)
  public user$!: Observable<UserDto | null>;

  public userId$: Observable<number | null>;
  
  public userName$: Observable<string | null>;
  
  public userEmail$: Observable<string | null>;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.userId$ = this.user$.pipe(map(u => u?.id || null));
    this.userName$ = this.user$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.user$.pipe(map(u => u?.email || ''));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}