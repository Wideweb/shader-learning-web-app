import { Pipe, PipeTransform } from '@angular/core';
import { TaskProgressDto } from '../../user-profile/models/task-progress.model';

@Pipe({name: 'userTaskResultStatus'})
export class UserTaskResultStatusPipe implements PipeTransform {
  transform(task: TaskProgressDto): string {
    if (task.accepted) {
      return 'Accepted';
    }

    if (task.rejected) {
      return 'Rejected';
    }

    return 'Not Submitted';
  }
}