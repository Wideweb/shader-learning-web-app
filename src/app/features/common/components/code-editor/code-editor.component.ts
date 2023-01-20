import { ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, ElementRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewContainerRef, } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { groupBy } from '../../services/utils';
import { CodeEditorOutput, CodeEditorPrompt } from './declarations';
import { CodeEditorLinePromptComponent } from './line-prompt/line-prompt.component';

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements OnChanges, OnDestroy {

  @ViewChild(CodemirrorComponent)
  public codemirror!: CodemirrorComponent;

  @Input()
  public code: string = '';

  @Input()
  public prompts: CodeEditorPrompt[] = [];

  @Output()
  public onRun = new EventEmitter();

  @Output()
  public onChange = new EventEmitter<string>();

  public output: CodeEditorOutput = { message: '', type: 'success' };

  constructor(
    private ref: ElementRef,
    private appRef: ApplicationRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
  ) {}

  private promptedLines: { line: number, widget: CodeMirror.LineWidget, wrapperRef: ComponentRef<CodeEditorLinePromptComponent> }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if ('prompts' in changes) {
      this.updatePrompts();
      const hasError = (this.prompts || []).some(p => p.type == 'error');
      if (hasError) {
        this.output.type = 'error';
        this.output.message = 'Program compilation error.';
      } else {
        this.output.type = 'success';
        this.output.message = 'Program successfully compiled.';
      }
    }
  }

  updatePrompts(): void {
    this.removePrompts();

    if (!this.prompts || this.prompts.length <= 0) {
      return;
    }

    const groupedPrompts = groupBy(this.prompts.filter(p => p.line >= 0), prompt => prompt.line);

    Object
      .entries(groupedPrompts)
      .forEach(([line, prompts]) => this.addPrompts(Number.parseInt(line), prompts));
  }

  addPrompts(line: number, prompts: CodeEditorPrompt[]) {
    const wrapperContainer = document.createElement('div');
    const wrapperRef = this.createLineWrapper(wrapperContainer);
    wrapperRef.instance.prompts = prompts;

    const widget = this.codemirror.codeMirror!.addLineWidget(line, wrapperContainer);

    this.promptedLines.push({line, widget, wrapperRef});
  }

  removePrompts() {
    this.promptedLines.forEach(item => {
      this.codemirror.codeMirror?.removeLineWidget(item.widget);
      this.appRef.detachView(item.wrapperRef.hostView);
      item.wrapperRef.destroy();
    });
    this.promptedLines = [];
  }

  createLineWrapper(container: HTMLElement) {
    const projectableNodes = [Array.prototype.slice.call(container.childNodes)];
    const factory = this.resolver.resolveComponentFactory(CodeEditorLinePromptComponent);
    const wrapperRef = factory.create(this.injector, projectableNodes, container);
    this.appRef.attachView(wrapperRef.hostView);
    return wrapperRef;
  }

  run(): void {
    this.onRun.emit();
  }

  hanldeCodeChange(code: string): void {
    this.onChange.emit(code);
  }

  ngOnDestroy(): void {
    this.removePrompts();
  }
}
