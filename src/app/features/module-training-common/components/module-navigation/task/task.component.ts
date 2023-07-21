import { Component, Input } from '@angular/core';
import { TaskProgressDto } from '../../../models/task-progress.model';

@Component({
  selector: 'module-navigation-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss'],
})
export class ModuleNavigationTaskComponent {
  @Input()
  public moduleId!: number;

  @Input()
  public task!: TaskProgressDto;

  @Input()
  public selected: boolean = false;

  @Input()
  public showStatusName: boolean = true;
}
