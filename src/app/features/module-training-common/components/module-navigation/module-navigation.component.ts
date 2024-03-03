import { Component, Input } from '@angular/core';
import { TaskProgressDto } from '../../models/task-progress.model';

@Component({
  selector: 'module-navigation',
  templateUrl: './module-navigation.component.html',
  styleUrls: ['./module-navigation.component.scss'],
})
export class ModuleNavigationComponent {
  @Input()
  public moduleId!: number;

  @Input()
  public tasks!: TaskProgressDto[];

  @Input()
  public selectedId: number = -1;

  @Input()
  public showStatusName: boolean = true;

  @Input()
  public truncate: boolean = false;

  isCurrentTask(task: TaskProgressDto) {
    return task.id == this.selectedId;
  }
}
