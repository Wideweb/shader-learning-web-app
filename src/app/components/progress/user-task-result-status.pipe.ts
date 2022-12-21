import { Pipe, PipeTransform } from '@angular/core';
import { UserTaskResultDto } from 'src/app/models/task.model';

@Pipe({name: 'userTaskResultStatus'})
export class UserTaskResultStatusPipe implements PipeTransform {
  transform(task: UserTaskResultDto): string {
    if (task.accepted) {
      return 'Accepted';
    }

    if (task.rejected) {
      return 'Rejected';
    }

    return 'Not Submitted';
  }
}