import { Component, Input } from '@angular/core';
import { TaskProgressDto } from 'src/app/features/module-progress/models/task-progress.model';

@Component({
  selector: 'module-navigation-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css'],
})
export class ModuleNavigationTaskComponent {
  @Input()
  public moduleId!: number;

  @Input()
  public task!: TaskProgressDto;

  @Input()
  public selected: boolean = false;
}
