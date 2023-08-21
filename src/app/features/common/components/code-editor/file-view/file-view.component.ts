import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FileViewInstance } from '../declarations';
import { EditorView } from '@codemirror/view';

@Component({
  selector: 'file-view',
  templateUrl: './file-view.component.html',
  styleUrls: ['./file-view.component.scss']
})
export class FileViewComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  public file: FileViewInstance | null = null;

  @ViewChild('editor') editorEl!: ElementRef;

  private editorView: EditorView | null = null;

  ngAfterViewInit(): void { 
    this.craeteEditor();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if ('file' in changes) {
      await this.craeteEditor();
    }
  }

  private async craeteEditor() {
    if (this.editorView) {
      this.editorView.destroy();
    }

    if (this.file && this.editorEl) {
      this.editorView = new EditorView({ state: this.file.state, parent: this.editorEl.nativeElement });
      this.editorView.dispatch({
        effects: EditorView.scrollIntoView(0),
      })

    } else {
      this.editorView = null;
    }
  }

  ngOnDestroy(): void {
    this.editorView?.destroy();
  }
}
