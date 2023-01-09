import { Component, Input } from '@angular/core';
import { TaskSubmitResultDto } from '../../models/task.model';

@Component({
  selector: 'task-result',
  templateUrl: './task-result.component.html',
  styleUrls: ['./task-result.component.css']
})
export class TaskResultComponent {
  @Input()
  public model!: TaskSubmitResultDto;
}
