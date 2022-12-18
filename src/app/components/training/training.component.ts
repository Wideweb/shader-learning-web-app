import { Component, Input, OnInit } from '@angular/core';
import { Task, TaskSubmit, TaskSubmitResult } from 'src/app/models/task.model';
import { TaskService } from 'src/app/services/task.service';
import { MatDialog } from '@angular/material/dialog';
import { TaskSubmitDialogComponent } from '../task-submit-dialog/task-submit-dialog.component';
import { TaskSubmitResultDialogComponent } from '../task-submit-result-dialog/task-submit-result-dialog.component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  public currentTask: Task | null = null;

  public taskSubmitResult: TaskSubmitResult | null = null;

  constructor(private taskService: TaskService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.next();
  }
  
  next(): void {
    this.currentTask = null;
    this.taskService.getNext().subscribe(task => {
      this.currentTask = task;
    });
  }

  submit(taskSubmit: TaskSubmit): void {
    this.taskSubmitResult = null;
    const submitRequiest = this.taskService.submit(taskSubmit);
    
    const submitDialog = this.dialog
      .open(TaskSubmitDialogComponent, { disableClose: true, });

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
