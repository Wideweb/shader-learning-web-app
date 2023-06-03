import { Component, Input } from '@angular/core';

export interface FeedbackCardModel {
  body: string;
  authorName: string;
  authorTitle: string;
}

@Component({
  selector: 'feedback-card',
  templateUrl: './feedback-card.component.html',
  styleUrls: ['./feedback-card.component.css']
})
export class FeedbackCardComponent {
  @Input()
  public isPrimary = true;

  @Input()
  public model!: FeedbackCardModel
}
