import { Component, Input, Output, EventEmitter, SimpleChange, OnChanges, SimpleChanges} from '@angular/core';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { TaskDto, TaskHintDto, TaskSubmitDto } from '../../models/task.model';

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
  public userFragmentShader: string = DEFAULT_FRAGMENT_SHADER;

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

  public visibleHints: TaskHintDto[] = [];

  public userFragmentShaderApplied: string = this.userFragmentShader;

  public programOutput = {
    error: false,
    message: ''
  };

  public compileTrigger = 0;

  public compiledDescription = '';

  ngOnChanges(changes: SimpleChanges): void {
    if ('userVertexShader' in changes) {
      this.userVertexShader = this.userVertexShader || DEFAULT_VERTEX_SHADER;
      this.run();
    }

    if ('userFragmentShader' in changes) {
      this.userFragmentShader = this.userFragmentShader || DEFAULT_FRAGMENT_SHADER;
      this.run();
    }

    if ('model' in changes) {
      if (this.model) {
        this.compiledDescription = marked.Parser.parse(marked.Lexer.lex(this.model.description));
      }
    }
  }

  run(): void {
    this.userFragmentShaderApplied = this.userFragmentShader;
    this.compileTrigger++;
  }

  submit(): void {
    const taskSubmit: TaskSubmitDto = {
      id: this.model.id,
      vertexShader: this.userVertexShader,
      fragmentShader: this.userFragmentShader,
    }
    this.onSubmit.emit(taskSubmit);
  }

  handleFragmentShaderCompilationError(message: string): void {
    console.log("handleFragmentShaderCompilationError");
    this.programOutput = {
      error: true,
      message,
    };
  }

  handleFragmentShaderCompilationSuccess(): void {
    console.log("handleFragmentShaderCompilationSuccess");
    this.programOutput = {
      error: false,
      message: 'Program successfully compiled.'
    };
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
}
