import { Component, Input } from '@angular/core';
import { TaskSubmitResult } from 'src/app/models/task.model';

@Component({
  selector: 'task-result',
  templateUrl: './task-result.component.html',
  styleUrls: ['./task-result.component.css']
})
export class TaskResultComponent {
  @Input()
  public model!: TaskSubmitResult;
}
