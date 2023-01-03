import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, map, Observable, skip, skipWhile, Subject, takeUntil } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Spinner } from './services/spinner.service';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'shader-learning';

  public score$: Observable<number>;
  public userId$: Observable<string | null>;
  public userName$: Observable<string | null>;
  public userEmail$: Observable<string | null>;

  private destroy$: Subject<boolean> = new Subject<boolean>();
  
  constructor(private auth: AuthService, private tasks: TaskService, private spinner: Spinner, private router: Router) {
    this.score$ = this.tasks.score$;
    this.userId$ = this.auth.me$.pipe(map(u => u?.id || ''));
    this.userName$ = this.auth.me$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.auth.me$.pipe(map(u => u?.email || ''));

    this.userEmail$.pipe(
      distinctUntilChanged(),
      skipWhile(email => !email),
      takeUntil(this.destroy$),
    ).subscribe(() => this.tasks.updateScore());

    this.isLoggedIn$.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
      filter(isLoggedIn => !isLoggedIn)
    ).subscribe(() => this.router.navigate(['/']))
  }
  
  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  public get isLoggedIn$() {
    return this.auth.isLoggedIn$;
  }

  public isSpinnerShown(): boolean {
    return this.spinner.isShown();
  }
}
