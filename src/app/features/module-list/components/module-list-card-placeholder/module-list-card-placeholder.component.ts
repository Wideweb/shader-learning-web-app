import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'module-list-card-placeholder',
  templateUrl: './module-list-card-placeholder.component.html',
  styleUrls: ['./module-list-card-placeholder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleListCardPlaceholderComponent {}
