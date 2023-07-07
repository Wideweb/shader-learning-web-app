import { AfterViewInit, Component, ElementRef, Input, OnDestroy } from '@angular/core';
import { CodeEditorPrompt } from '../declarations';

@Component({
  selector: 'code-editor-line-prompt',
  templateUrl: './line-prompt.component.html',
  styleUrls: ['./line-prompt.component.scss']
})
export class CodeEditorLinePromptComponent implements AfterViewInit, OnDestroy {
  @Input()
  public prompts: CodeEditorPrompt[] = [];

  @Input()
  public codeLineHTML!: HTMLElement;

  private lineRef: HTMLElement | null = null;

  // constructor(private hostRef: ElementRef) {}

  ngAfterViewInit(): void {
    // this.lineRef = this.hostRef.nativeElement.closest(".CodeMirror-linewidget").parentElement;
    // if (this.lineRef) {
    //   this.lineRef!.classList.add('CodeMirror-line-error');
    // }
  }

  ngOnDestroy(): void {
    // if (this.lineRef) {
    //   this.lineRef!.classList.remove('CodeMirror-line-error');
    // }
  }
}
