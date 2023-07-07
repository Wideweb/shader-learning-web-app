import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { CodeEditorLinterRule, FileEditorInstance, FileError } from '../declarations';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { EditorView } from '@codemirror/view';
import { lineError } from '../configs/line-error';

@Component({
  selector: 'file-editor',
  templateUrl: './file-editor.component.html',
  styleUrls: ['./file-editor.component.scss']
})
export class FileEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input()
  public file: FileEditorInstance | null = null;

  @Input()
  public rules: CodeEditorLinterRule[] = [];

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
    if (!this.file) {
      return;
    }
    this.editorView?.dispatch({
      effects: this.file.configs.errors.reconfigure(lineError(errors.map(e => ({...e, line: e.line + 2}))))
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
