import { Component, Input } from '@angular/core';

@Component({
  selector: 'module-training-navigation-task-status',
  templateUrl: './task-status.component.html',
  styleUrls: ['./task-status.component.css'],
})
export class ModuleTrainingNavigationTaskStatusComponent {
  @Input()
  public selected: boolean = false;

  @Input()
  public accepted: boolean = false;

  @Input()
  public locked: boolean = false;
}
