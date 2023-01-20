import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.css']
})
export class AppTooltipComponent implements OnInit {
  @Input() text: string = '';

  @Input() contentTemplate: TemplateRef<any> | null = null;

  constructor() { }

  ngOnInit() { }
}
