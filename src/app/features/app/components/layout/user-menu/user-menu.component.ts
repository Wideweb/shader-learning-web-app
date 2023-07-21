import { Component, Input } from "@angular/core";

@Component({
  selector: 'app-user-menu',
  templateUrl: './user-menu.component.html',
  styleUrls: ['./user-menu.component.scss'],
})
export class AppUserMenuComponent {

  @Input()
  public symbol: string = '';

  @Input()
  public name: string = '';

  @Input()
  public email: string = '';

  @Input()
  public rank = 0;
}