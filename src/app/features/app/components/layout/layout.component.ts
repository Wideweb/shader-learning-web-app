import { AfterViewInit, Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Select } from '@ngxs/store';
import { BehaviorSubject, delay, filter, map, Observable, Subject, takeUntil } from 'rxjs';
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

  public userSymbol$: Observable<string | null>;

  public hidePageOverflowSubject = new BehaviorSubject<boolean>(false);

  public hidePageOverflow$: Observable<boolean>;

  public showFooterScrollCtrlSubject = new BehaviorSubject<boolean>(false);

  public showFooterScrollCtrl$: Observable<boolean>;

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
    this.userSymbol$ = this.user$.pipe(map(u => u?.email[0].toUpperCase() || ''));

    this.hidePageOverflow$ = this.hidePageOverflowSubject.asObservable().pipe(delay(0));
    this.showFooterScrollCtrl$ = this.showFooterScrollCtrlSubject.asObservable().pipe(delay(0));
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
        this.scrollTop(true);
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

  scrollTop(instant: boolean = false) :void {
    document.querySelector('.page-scroll')?.scroll({ 
      top: 0, 
      left: 0, 
      behavior: (instant === true ? 'instant' : 'smooth') as ScrollBehavior
    });
  }

  updatePageOverflow() :void {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot !== null) {
      if (snapshot.data['hidePageOverflow']) {
        this.hidePageOverflowSubject.next(true);
        return;
      }
      snapshot = snapshot.firstChild;
    }
    this.hidePageOverflowSubject.next(false);
  }

  updateFooterScrollCtrlVisibility() :void {
    let snapshot: ActivatedRouteSnapshot | null = this.route.snapshot;
    while (snapshot !== null) {
      if (snapshot.data['showFooterScrollCtrl']) {
        this.showFooterScrollCtrlSubject.next(true);
        return;
      }
      snapshot = snapshot.firstChild;
    }
    this.showFooterScrollCtrlSubject.next(false);
  }

  onScroll(event: Event): void {
    const top = (document.getElementById('main') as HTMLElement).getBoundingClientRect().top;
    this.appEvents.pageScroll(top);
  }

  ngOnDestroy(): void {
    this.showFooterScrollCtrlSubject.unsubscribe();
    this.showFooterScrollCtrlSubject.unsubscribe();

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}