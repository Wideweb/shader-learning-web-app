import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { createGUID } from 'src/app/features/common/services/utils';

@Component({
  selector: 'task-channel',
  templateUrl: './task-channel.component.html',
  styleUrls: ['./task-channel.component.css'],
  providers: [{ 
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TaskChannelComponent),
    multi: true
   }]
})
export class TaskChannelComponent implements ControlValueAccessor {
  @Input()
  public label: string = '';

  @Input()
  public set file(value: File | null) { 
    this._file = value;
    this.updatePreview();
    this.onChange(this._file);
  }

  public get file(): File | null { return this._file; }

  @Output()
  public onSelect = new EventEmitter<File | null>();

  @Output()
  public onClear = new EventEmitter<void>();

  private _file: File | null = null;

  public preview: string | ArrayBuffer | null | undefined = null;

  public id: string;

  constructor() {
    this.id = createGUID();
  }

  updatePreview() {
    if (!(this.file instanceof Blob)) {
      this.preview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => (this.preview = e.target?.result);
    reader.readAsDataURL(this.file as File);
  }

  selectFile(event: Event): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    this.file = !files  || files.length < 1 ? null : files[0];
    this.onSelect.emit(this.file);
  }

  clear() {
    this.file = null;
    this.onClear.emit();
  }

  writeValue(file: File | null): void {
    this.file = file;
    this.updatePreview();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  onChange(_: any) {}

  registerOnTouched(fn: any): void { }

  setDisabledState?(isDisabled: boolean): void { }
}
