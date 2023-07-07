import { Component } from '@angular/core';

@Component({
  selector: 'module-navigation-placeholder',
  templateUrl: './module-navigation-placeholder.component.html',
  styleUrls: ['./module-navigation-placeholder.component.scss'],
})
export class ModuleNavigationPlaceholderComponent {
    public placeholders = [...Array(30).keys()];
}
