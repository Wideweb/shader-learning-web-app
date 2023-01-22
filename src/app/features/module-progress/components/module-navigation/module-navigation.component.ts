import { Component, Input } from '@angular/core';
import { TaskProgressDto } from 'src/app/features/module-progress/models/task-progress.model';

@Component({
  selector: 'module-navigation',
  templateUrl: './module-navigation.component.html',
  styleUrls: ['./module-navigation.component.css'],
})
export class ModuleNavigationComponent {
  @Input()
  public moduleId!: number;

  @Input()
  public tasks!: TaskProgressDto[];

  @Input()
  public selectedId: number = -1;

  isCurrentTask(task: TaskProgressDto) {
    return task.id == this.selectedId;
  }
}
