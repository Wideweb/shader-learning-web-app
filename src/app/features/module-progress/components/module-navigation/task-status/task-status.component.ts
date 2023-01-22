import { Component, Input } from '@angular/core';

@Component({
  selector: 'module-navigation-task-status',
  templateUrl: './task-status.component.html',
  styleUrls: ['./task-status.component.css'],
})
export class ModuleNavigationTaskStatusComponent {
  @Input()
  public selected: boolean = false;

  @Input()
  public accepted: boolean = false;

  @Input()
  public locked: boolean = false;
}
