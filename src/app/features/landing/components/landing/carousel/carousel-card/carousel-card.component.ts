import { Component, Input } from '@angular/core';

export interface CarouselCardModel {
  title: string;
  body: string;
  label: string;
  link: string;
}

@Component({
  selector: 'carousel-card',
  templateUrl: './carousel-card.component.html',
  styleUrls: ['./carousel-card.component.css']
})
export class CarouselCardComponent {
  @Input()
  public model!: CarouselCardModel
}
