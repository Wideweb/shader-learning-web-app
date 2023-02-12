import { Component, Input, Output, EventEmitter, SimpleChange, OnChanges, SimpleChanges, ElementRef, ComponentFactoryResolver} from '@angular/core';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { TaskDto, TaskHintDto, TaskSubmitDto } from '../../models/task.model';
import { CodeEditorPrompt } from 'src/app/features/common/components/code-editor/declarations';
import { UserFragmentProgram } from '../../state/module-progress.state';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnChanges {
  @Input()
  public model!: TaskDto;

  @Input()
  public userVertexShader: string = DEFAULT_VERTEX_SHADER;

  @Input()
  public userFragmentShader!: UserFragmentProgram;

  @Input()
  public liked: boolean = false;

  @Input()
  public disliked: boolean = false;

  @Input()
  public canEdit: boolean = false;

  @Output()
  public onEdit = new EventEmitter<void>();

  @Output()
  public onSubmit = new EventEmitter<TaskSubmitDto>();

  @Output()
  public onLike = new EventEmitter<boolean>();

  @Output()
  public onDislike = new EventEmitter<boolean>();

  @Output()
  public onFragmentCodeChange = new EventEmitter<string>();

  @Output()
  public onResetToLastSubmettedCode = new EventEmitter<void>();

  @Output()
  public onResetToDefaultCode = new EventEmitter<void>();

  public visibleHints: TaskHintDto[] = [];

  public userFragmentShaderApplied: string = this.userFragmentShader?.code || DEFAULT_FRAGMENT_SHADER;

  public programPrompts: CodeEditorPrompt[] = [];

  public compileTrigger = 0;

  public compiledDescription = '';

  constructor(private ref: ElementRef, private resolver: ComponentFactoryResolver) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('userVertexShader' in changes) {
      this.userVertexShader = this.userVertexShader || DEFAULT_VERTEX_SHADER;
      this.run();
    }

    if ('userFragmentShader' in changes && this.userFragmentShader.compile) {
      this.run();
    }

    if ('model' in changes) {
      if (this.model) {
        this.compiledDescription = marked.Parser.parse(marked.Lexer.lex(this.model.description));
      }
    }
  }

  handleCodeChange(code: string) {
    this.onFragmentCodeChange.emit(code);
  }

  run(): void {
    this.userFragmentShaderApplied = this.userFragmentShader?.code || DEFAULT_FRAGMENT_SHADER;
    this.compileTrigger++;
  }

  submit(): void {
    const taskSubmit: TaskSubmitDto = {
      id: this.model.id,
      vertexShader: this.userVertexShader,
      fragmentShader: this.userFragmentShader.code,
    }
    this.onSubmit.emit(taskSubmit);
  }

  handleFragmentShaderCompilationError(errors: {line: number; message: string}[]): void {
    this.programPrompts = errors.map(error => ({ line: error.line, message: error.message, type: 'error' }));
  }

  handleFragmentShaderCompilationSuccess(): void {
    this.programPrompts = [];
  }

  hasHints(): boolean {
    return this.model.hints.length > 0;
  }

  revealHint(hint: TaskHintDto) {
    this.visibleHints.push(hint);
  }

  isHintRevealed(hint: TaskHintDto) {
    return this.visibleHints.includes(hint);
  }

  like() {
    this.onLike.emit();
  }

  dislike() {
    this.onDislike.emit();
  }

  edit() {
    this.onEdit.emit();
  }

  resetToLastSubmettedCode() {
    this.onResetToLastSubmettedCode.emit();
  }

  resetToDefaultCode() {
    this.onResetToDefaultCode.emit();
  }
}
