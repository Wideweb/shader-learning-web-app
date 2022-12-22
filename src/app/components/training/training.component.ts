import { Component, OnInit } from '@angular/core';
import { Task, TaskSubmit, TaskSubmitResult } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/app.constants';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  public currentTask: Task | null = null;

  public userVertexShader: string = DEFAULT_VERTEX_SHADER;

  public userFragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public taskSubmitResult: TaskSubmitResult | null = null;

  readonly loaded$ = new BehaviorSubject<boolean>(false);

  constructor(private taskService: TaskService, private dialog: MatDialog, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.next(id);
  }
  
  next(id: number | null = null): void {
    this.loaded$.next(false);
    this.currentTask = null;

    const request = id ? this.taskService.getUserTask(id) : this.taskService.getNext();
    request.subscribe(userTask => {
      this.currentTask = userTask.task;
      this.userVertexShader = userTask.vertexShader || DEFAULT_VERTEX_SHADER;
      this.userFragmentShader = userTask.fragmentShader || DEFAULT_FRAGMENT_SHADER;
      this.loaded$.next(true);
    });
  }

  submit(taskSubmit: TaskSubmit): void {
    this.taskSubmitResult = null;
    const submitRequiest = this.taskService.submit(taskSubmit, this.currentTask!);
    
    const submitDialog = this.dialog
      .open(TaskSubmitDialogComponent, { disableClose: true });

    submitDialog
      .afterClosed()
      .pipe(takeUntil(submitRequiest))
      .subscribe(result => result);

      submitRequiest.subscribe(result => {
        this.taskSubmitResult = result;
        submitDialog.close();
        this.showSubmitResult(result);
      });
  }

  showSubmitResult(taskSubmitResult: TaskSubmitResult) {
    this.dialog
      .open<TaskSubmitResultDialogComponent, TaskSubmitResult, boolean>(TaskSubmitResultDialogComponent, { 
        disableClose: true,
        data: taskSubmitResult
      })
      .afterClosed()
      .subscribe(result => result ? this.next() : this.retry());
  }

  retry(): void { }
}
