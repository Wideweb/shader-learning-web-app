import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'task-channel',
  templateUrl: './task-channel.component.html',
  styleUrls: ['./task-channel.component.scss'],
})
export class TaskChannelComponent implements OnChanges {
  @Input()
  public label: string = '';

  @Input()
  public file: File | boolean | null = null;

  public preview: string | ArrayBuffer | null | undefined = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('file' in changes) {
      this.updatePreview();
    }
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
}
