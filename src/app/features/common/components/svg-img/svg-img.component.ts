import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-svg-img',
  templateUrl: './svg-img.component.html',
  styleUrls: ['./svg-img.component.scss'],
})
export class AppSvgImageComponent {

  @Input()
  public src?: string;
}