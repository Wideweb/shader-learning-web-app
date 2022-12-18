import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
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

  public score$: Observable<number>
  
  constructor(private auth: AuthService, private tasks: TaskService, private spinner: Spinner) {
    this.score$ = tasks.score$;
  }
  
  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.auth.updateMe();
      this.tasks.updateScore();
    }
  }

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
