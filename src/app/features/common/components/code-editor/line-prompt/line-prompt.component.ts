import { Component, Input } from '@angular/core';
import { CodeEditorPrompt } from '../declarations';

@Component({
  selector: 'code-editor-line-prompt',
  templateUrl: './line-prompt.component.html',
  styleUrls: ['./line-prompt.component.css']
})
export class CodeEditorLinePromptComponent {
  @Input()
  public prompts: CodeEditorPrompt[] = [];

  @Input()
  public codeLineHTML!: HTMLElement;
}
