import { Component, Input } from '@angular/core';

export interface FeedbackCardModel {
  message: string;
  authorName: string;
  authorTitle: string;
}

@Component({
  selector: 'feedback-card',
  templateUrl: './feedback-card.component.html',
  styleUrls: ['./feedback-card.component.scss']
})
export class FeedbackCardComponent {
  @Input()
  public isPrimary = true;

  @Input()
  public model!: FeedbackCardModel
}
