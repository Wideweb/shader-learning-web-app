import { Component, Input, Output, EventEmitter, SimpleChange, OnChanges, SimpleChanges, ElementRef, ComponentFactoryResolver} from '@angular/core';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { TaskDto, TaskHintDto, TaskSubmitDto } from '../../models/task.model';
import { CodeEditorFile, CodeEditorPrompt, CodeEditorPrompts } from 'src/app/features/common/components/code-editor/declarations';
import { UserShaderProgram } from '../../state/module-progress.state';
import { UserTaskSubmissionDto } from '../../models/user-task.model';
import { GlProgramErrors } from 'src/app/features/common/components/gl-scene/gl-scene.component';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnChanges {
  @Input()
  public model!: TaskDto;

  @Input()
  public vertexShader: string = DEFAULT_VERTEX_SHADER;

  @Input()
  public shaderProgram!: UserShaderProgram;

  @Input()
  public submissions!: UserTaskSubmissionDto[];

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
  public onUShaderProgramChange = new EventEmitter<{vertex: string, fragment: string}>();

  @Output()
  public onResetToLastSubmettedCode = new EventEmitter<void>();

  @Output()
  public onResetToDefaultCode = new EventEmitter<void>();

  @Output()
  public onSubmissionSelect = new EventEmitter<UserTaskSubmissionDto>();

  public visibleHints: TaskHintDto[] = [];

  public vertexShaderApplied: string = this.shaderProgram?.vertex || DEFAULT_VERTEX_SHADER;

  public fragmentShaderApplied: string = this.shaderProgram?.fragment || DEFAULT_FRAGMENT_SHADER;

  public programPrompts: CodeEditorPrompts = {};

  public programFiles: CodeEditorFile[] = [];

  public compileTrigger = 0;

  public compiledDescription = '';

  constructor(private ref: ElementRef, private resolver: ComponentFactoryResolver) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('shaderProgram' in changes || 'model' in changes) {
      this.createProgramFiles();
    }

    if ('shaderProgram' in changes && this.shaderProgram.compile) {
      this.run();
    }

    if ('model' in changes) {
      if (this.model) {
        this.compiledDescription = marked.Parser.parse(marked.Lexer.lex(this.model.description));
      }
    }
  }

  createProgramFiles() {
    if (!this.model || !this.shaderProgram) {
      this.programFiles = [];
      return;
    }

    const vertexFile = this.programFiles.find(f => f.name === 'vertex.glsl');
    const fragmentFile = this.programFiles.find(f => f.name === 'fragment.glsl');

    if (this.model.vertexCodeEditable) {
      if (vertexFile) {
        vertexFile.data = this.shaderProgram.vertex;
      } else {
        this.programFiles.push({ 
          name: 'vertex.glsl',
          data: this.shaderProgram.vertex,
          mode: 'x-shader/x-vertex'
        });
      }
    }

    if (!this.model.vertexCodeEditable && vertexFile) {
      this.programFiles = this.programFiles.filter(f => f !== vertexFile);
    }

    if (this.model.fragmentCodeEditable) {
      if (fragmentFile) {
        fragmentFile.data = this.shaderProgram.fragment;
      } else {
        this.programFiles.push({ 
          name: 'fragment.glsl',
          data: this.shaderProgram.fragment,
          mode: 'x-shader/x-fragment'
        });
      }
    }

    if (!this.model.fragmentCodeEditable && fragmentFile) {
      this.programFiles = this.programFiles.filter(f => f !== fragmentFile);
    }
  }

  handleProgramFileChange(file: CodeEditorFile) {
    const vertex = file.name === 'vertex.glsl' ? file.data : this.shaderProgram.vertex;
    const fragment = file.name === 'fragment.glsl' ? file.data : this.shaderProgram.fragment;

    this.onUShaderProgramChange.emit({vertex, fragment});
  }

  run(): void {
    this.vertexShaderApplied = this.shaderProgram?.vertex;
    this.fragmentShaderApplied = this.shaderProgram?.fragment;
    this.compileTrigger++;
  }

  submit(): void {
    const taskSubmit: TaskSubmitDto = {
      id: this.model.id,
      vertexShader: this.shaderProgram.vertex,
      fragmentShader: this.shaderProgram.fragment,
    }
    this.onSubmit.emit(taskSubmit);
  }

  handleProgramCompilationError(errors: GlProgramErrors): void {
    this.programPrompts = {
      ['vertex.glsl']: errors.vertex.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
      ['fragment.glsl']: errors.fragment.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
    }
  }

  handleProgramCompilationSuccess(): void {
    this.programPrompts = {};
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

  selectSubmission(submission: UserTaskSubmissionDto) {
    this.onSubmissionSelect.emit(submission);
  }
}
