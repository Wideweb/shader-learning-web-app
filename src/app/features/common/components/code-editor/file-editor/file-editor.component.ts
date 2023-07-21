import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FileEditorInstance, FileError } from '../declarations';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Decoration, EditorView } from '@codemirror/view';
import { LineErrorWidget } from '../configs/line-error';
import { Range } from '@codemirror/state';
import { addDecoration, filterDecoration } from '../configs/line-decorations';

@Component({
  selector: 'file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss']
})
export class FileEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  public file: FileEditorInstance | null = null;

  @ViewChild('editor') editorEl!: ElementRef;

  private editorView: EditorView | null = null;

  private destroy$: Subject<boolean> = new Subject<boolean>();

  private fileErrorSubscription: Subscription | null = null;

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

      if (this.fileErrorSubscription) {
        this.fileErrorSubscription.unsubscribe();
      }
      this.fileErrorSubscription = this.file.errors$
        .pipe(takeUntil(this.destroy$))
        .subscribe(errors => this.displayLineErrors(errors));

    } else {
      this.editorView = null;
    }
  }

  displayLineErrors(errors: FileError[]) {
    if (!this.file || !this.editorView) {
      return;
    }

    const widgets: Range<Decoration>[] = [];
    for (let i = 0; i < errors.length; i++) {
      const error = errors[i];
      const widget = Decoration.widget({
          widget: new LineErrorWidget(error.message, error.line),
          side: -1,
          block: true,
      });

      widgets.push(widget.range(this.editorView.state.doc.line(error.line + 2).from));
    }

    this.editorView?.dispatch({
      annotations: [
        filterDecoration.of(() => false),
        ...(widgets.length > 0 ? [addDecoration.of(widgets)] : []),
      ]
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();

    if (this.fileErrorSubscription) {
      this.fileErrorSubscription.unsubscribe();
    }

    this.editorView?.destroy();
  }
}
