import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface ModuleListCardModel {
  title: string;
  body: string;
  label: string;
  link: string;
  imageSrc: string;
  locked: boolean;
}

@Component({
  selector: 'module-list-card',
  templateUrl: './module-list-card.component.html',
  styleUrls: ['./module-list-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModuleListCardComponent {
  @Input()
  public model!: ModuleListCardModel
}
