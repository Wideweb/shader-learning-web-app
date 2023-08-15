import { Component, Input } from '@angular/core';
import { ComponentSize } from '../../../constants';

@Component({
  selector: 'donate',
  templateUrl: './donate.component.html',
  styleUrls: ['./donate.component.scss']
})
export class LandingDonateComponent {
  @Input()
  public size: ComponentSize = ComponentSize.Big;

  get isSmall() {
    return this.size === ComponentSize.Small;
  }

  get isMedium() {
    return this.size === ComponentSize.Medium;
  }

  get isBig() {
    return this.size === ComponentSize.Big;
  }
}
