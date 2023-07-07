import { Component, forwardRef } from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppCheckboxComponent),
      multi: true
    }
  ]
})
export class AppCheckboxComponent implements ControlValueAccessor {

  public checked = false;

  public disabled = false;

  public onChange: any = () => {};

  public onTouched: any = () => {};

  get value() {
    return this.checked;
  }

  set value(value) {
    this.checked = value;
    this.onChange(value);
    this.onTouched();
  }

  writeValue(value: boolean): void {
    this.checked = value;
  }
  
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggle(): void {
    this.value = !this.value;
  }
}