import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export interface CarouselCardModel {
  title: string;
  body: string;
  label: string;
  link: string;
  imageSrc: string;
}

@Component({
  selector: 'carousel-card',
  templateUrl: './carousel-card.component.html',
  styleUrls: ['./carousel-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarouselCardComponent {
  @Input()
  public model!: CarouselCardModel

  @Input()
  public last = false;
}
