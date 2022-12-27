import { Component, OnInit } from '@angular/core';
import { distinctUntilChanged, map, Observable, skip, skipWhile } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Spinner } from './services/spinner.service';
import { TaskService } from './services/task.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'shader-learning';

  public score$: Observable<number>;
  public userId$: Observable<string | null>;
  public userName$: Observable<string | null>;
  public userEmail$: Observable<string | null>;
  
  constructor(private auth: AuthService, private tasks: TaskService, private spinner: Spinner) {
    this.score$ = this.tasks.score$;
    this.userId$ = this.auth.me$.pipe(map(u => u?.id || ''));
    this.userName$ = this.auth.me$.pipe(map(u => u?.name || ''));
    this.userEmail$ = this.auth.me$.pipe(map(u => u?.email || ''));

    this.userEmail$.pipe(
      distinctUntilChanged(),
      skipWhile(email => !email)
    ).subscribe(() => this.tasks.updateScore());
  }
  
  ngOnInit(): void { }

  public isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  public isLoggedOut(): boolean {
    return this.auth.isLoggedOut();
  }

  public isSpinnerShown(): boolean {
    return this.spinner.isShown();
  }
}
