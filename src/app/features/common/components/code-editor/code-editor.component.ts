import { AfterViewInit, ApplicationRef, Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Injector, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild, ViewContainerRef, } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import * as CodeMirror from 'codemirror';
import { groupBy } from '../../services/utils';
import { CodeEditorAutocomplete } from './code-editor-autocomplete';
import { CodeEditorOutput, CodeEditorPrompt, CodeEditorFile, CodeEditorPrompts } from './declarations';
import { CodeEditorLinePromptComponent } from './line-prompt/line-prompt.component';

const EMPTY_FILE: CodeEditorFile = {
  name: '',
  data: '',
  mode: '',
  hasError: false,
}

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.css']
})
export class CodeEditorComponent implements AfterViewInit, OnChanges, OnDestroy, OnChanges {

  @ViewChild(CodemirrorComponent)
  public codemirror!: CodemirrorComponent;

  @Input()
  public files: CodeEditorFile[] = [];

  @Input()
  public prompts: CodeEditorPrompts = {};

  @Output()
  public onRun = new EventEmitter();

  @Output()
  public onChange = new EventEmitter<CodeEditorFile>();

  public currentFile: CodeEditorFile = EMPTY_FILE;

  public output: CodeEditorOutput = { message: '', type: 'success' };

  private static autocomplete: CodeEditorAutocomplete = new CodeEditorAutocomplete();

  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private resolver: ComponentFactoryResolver,
  ) {}

  private promptedLines: { line: number, widget: CodeMirror.LineWidget, wrapperRef: ComponentRef<CodeEditorLinePromptComponent> }[] = [];

  ngAfterViewInit() { 
    this.initCodeMirror();
  }

  initCodeMirror(): void {
    if (!this.codemirror.codeMirror) {
      setTimeout(() => this.initCodeMirror(), 100);
      return;
    }

    this.initCodeMirrorAutocomplete();
  }

  initCodeMirrorAutocomplete(): void {
    this.codemirror.codeMirror?.on("inputRead", (instance) => {
      if (instance.state.completionActive) {
        return;
      }

      CodeMirror.commands.autocomplete(
        instance,
        (editor, otions) => CodeEditorComponent.autocomplete.showHints(editor, otions),
        { completeSingle: false }
      );
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('prompts' in changes) {
      this.updatePrompts();
      this.updateFilesStatus();
      const hasError = (this.files || []).some(f => f.hasError);
      if (hasError) {
        this.output.type = 'error';
        this.output.message = 'Program compilation error.';
      } else {
        this.output.type = 'success';
        this.output.message = 'Program successfully compiled.';
      }
    }

    if ('files' in changes)
    {
      if (!this.files || this.files.length === 0)
      {
        this.currentFile = EMPTY_FILE;
      } else {
        this.currentFile = this.files[0];
      }
      this.updateFilesStatus();
    }
  }

  public selectFile(event: MatTabChangeEvent) {
    this.currentFile = this.files[event.index];
    setTimeout(() => this.updatePrompts(), 100);
  }

  updateFilesStatus(): void {
    if (!this.files || this.files.length === 0) {
      return;
    }

    for (const file of this.files) {
      file.hasError = (this.prompts[file.name] || []).some(p => p.type == 'error');
    }
  }

  updatePrompts(): void {
    this.removePrompts();

    const filePrompts = this.prompts[this.currentFile.name];

    if (!filePrompts || filePrompts.length <= 0) {
      return;
    }

    const groupedPrompts = groupBy(filePrompts.filter(p => p.line >= 0), prompt => prompt.line);

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

  hanldeCodeChange(data: string): void {
    this.onChange.emit({...this.currentFile, data});
  }

  ngOnDestroy(): void {
    this.removePrompts();
  }
}
