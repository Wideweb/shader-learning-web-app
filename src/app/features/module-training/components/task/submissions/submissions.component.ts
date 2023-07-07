import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserTaskSubmissionDto } from '../../../models/user-task.model';

@Component({
  selector: 'task-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.css']
})
export class TaskSubmissionsComponent {
  @Input()
  public data: UserTaskSubmissionDto[] = [];

  @Output()
  public onSubmissionSelect = new EventEmitter<UserTaskSubmissionDto>();

  select(submission: UserTaskSubmissionDto) {
    this.onSubmissionSelect.emit(submission);
  }
}
