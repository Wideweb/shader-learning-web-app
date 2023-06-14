import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { filter, map, Observable, Subject, take, takeUntil } from 'rxjs';
import { UserDto } from 'src/app/features/auth/models/user.model';
import { AuthState } from 'src/app/features/auth/state/auth.state';
import { AppEventService } from 'src/app/features/common/services/event.service';
import { ComponentSize } from 'src/app/features/landing/constants';
import { UserProfileState } from 'src/app/features/user-profile/state/user-profile.state';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class AppLayoutComponent implements AfterViewInit, OnInit {
  
  public isNavbarMenuCollapsed = true;

  @Select(AuthState.isAuthenticated)
  public isAuthenticated$!: Observable<boolean>;

  @Select(UserProfileState.meRank)
  public userRank$!: Observable<number>;

  @Select(AuthState.user)
  public user$!: Observable<UserDto | null>;

  public userId$: Observable<number | null>;
  
  public userName$: Observable<string | null>;
  
  public userEmail$: Observable<string | null>;

  public hidePageOverflow$ = new Subject<boolean>();

  public showFooterScrollCtrl$ = new Subject<boolean>();

  private destroy$: Subject<boolean> = new Subject<boolean>();

  public size = ComponentSize.Big;

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  get isMedium() {
    return this.size === ComponentSize.Medium;
  }

  get isBig() {
    return this.size === ComponentSize.Big;
  }

  constructor(private route: ActivatedRoute, private router: Router, private appEvents: AppEventService) {
    this.userId$ = this.user$.pipe(map(u => u?.id || null));
    this.userName$ = this.user$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.user$.pipe(map(u => u?.email || ''));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.resize();
  }

  ngAfterViewInit(): void {
    this.resize();
    this.updatePageOverflow();
    this.updateFooterScrollCtrlVisibility();
  }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      ).subscribe(() => {
        this.updatePageOverflow();
        this.updateFooterScrollCtrlVisibility();
      });
  }

  resize(): void {
    if (window.innerWidth < 640) {
      this.size = ComponentSize.Small;
    } else if (window.innerWidth < 1024) {
      this.size = ComponentSize.Medium;
    } else {
      this.isNavbarMenuCollapsed = true;
      this.size = ComponentSize.Big;
    }
  }

  showNavbarMenu(): void {
    this.isNavbarMenuCollapsed = false;
  }

  hideNavbarMenu(): void {
    this.isNavbarMenuCollapsed = true;
  }

  scrollTop() :void {
    document.querySelector('.page-scroll')?.scroll({ 
      top: 0, 
      left: 0, 
      behavior: 'smooth' 
    });
  }

  updatePageOverflow() :void {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot !== null) {
      if (snapshot.data['hidePageOverflow']) {
        this.hidePageOverflow$.next(true);
        return;
      }
      snapshot = snapshot.firstChild;
    }
    this.hidePageOverflow$.next(false);
  }

  updateFooterScrollCtrlVisibility() :void {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot !== null) {
      if (snapshot.data['showFooterScrollCtrl']) {
        this.showFooterScrollCtrl$.next(true);
        return;
      }
      snapshot = snapshot.firstChild;
    }
    this.showFooterScrollCtrl$.next(false);
  }

  onScroll(event: Event): void {
    const top = (document.getElementById('main') as HTMLElement).getBoundingClientRect().top;
    this.appEvents.pageScroll(top);
  }

  ngOnDestroy(): void {
    this.hidePageOverflow$.unsubscribe();
    this.showFooterScrollCtrl$.unsubscribe();

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}