import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, ElementRef, OnDestroy, HostListener} from '@angular/core';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { CodeEditorLinterRule, FileEditorInstance, FileError } from 'src/app/features/common/components/code-editor/declarations';
import { createFileEditorInstance } from 'src/app/features/common/components/code-editor/file-editor/file-editor-factory';
import { UserShaderProgram } from 'src/app/features/module-training-common/state/module-training-common.state';
import { TaskDto, TaskHintDto, TaskSubmitDto } from 'src/app/features/module-training-common/models/task.model';
import { UserTaskSubmissionDto } from 'src/app/features/module-training-common/models/user-task.model';
import { GlProgramErrors } from 'src/app/features/common/components/gl-scene/gl-scene.component';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompilationErrorToastToastComponent } from './compilation-error-toast/compilation-error-toast.component';
import { CompilationSuccessToastComponent } from './compilation-success-toast/compilation-success-toast.component';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.scss']
})
export class TaskComponent implements OnChanges, OnDestroy {
  @Input()
  public model!: TaskDto;

  @Input()
  public vertexShader: string = DEFAULT_VERTEX_SHADER;

  @Input()
  public shaderProgram!: UserShaderProgram;

  @Input()
  public submissions!: UserTaskSubmissionDto[];

  @Input()
  public accepted: boolean = false;

  @Input()
  public liked: boolean = false;

  @Input()
  public disliked: boolean = false;

  @Input()
  public canEdit: boolean = false;

  @Input()
  public isPrevTaskAvailable: boolean = false;

  @Input()
  public isNextTaskAvailable: boolean = false;

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

  @Output()
  public onSwitchToNext = new EventEmitter<void>();

  @Output()
  public onSwitchToPrev = new EventEmitter<void>();

  public visibleHints: TaskHintDto[] = [];

  public vertexShaderApplied: string = this.shaderProgram?.vertex || DEFAULT_VERTEX_SHADER;

  public fragmentShaderApplied: string = this.shaderProgram?.fragment || DEFAULT_FRAGMENT_SHADER;

  public programFiles: FileEditorInstance[] = [];

  public programLinterRules: CodeEditorLinterRule[] = [];

  public compileTrigger = 0;

  public compiledTaskDescription = '';

  public compiledTheoryDescription = '';

  public hasCompilationError = false;

  public hideCompilationStatus$ = new Subject();

  public compilationStatusShown = false;

  public isOutputHidden = false;

  private vertexFile: FileEditorInstance | null = null;

  private fragmentFile: FileEditorInstance | null = null;

  private activeTask: 'task' | 'theory' | 'answer' = 'task';

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private ref: ElementRef, private snackBar: MatSnackBar) {
    this.hideCompilationStatus$.pipe(
      debounceTime(2000),
      takeUntil(this.destroy$),
    ).subscribe(() => (this.compilationStatusShown = false));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey && event.key === 'r') {
      event.preventDefault();
      this.run();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    //  || 'model' in changes
    if ('shaderProgram' in changes) {
      this.createProgramFiles();
    }

    if ('shaderProgram' in changes && this.shaderProgram.compile) {
      this.run();
    }

    if ('model' in changes) {
      if (this.model) {
        const descSrc = this.model.description.split('### Task');
        this.compiledTheoryDescription = marked.Parser.parse(marked.Lexer.lex(descSrc[0]));
        this.compiledTaskDescription = marked.Parser.parse(marked.Lexer.lex(descSrc[1]));
      }

      this.activateTab('task');
    }
  }

  createProgramFiles() {
    this.programFiles = [];

    if (!this.model || !this.shaderProgram) {
      return;
    }

    const rules: CodeEditorLinterRule[]  = this.model.rules.map((rule) => ({
      keyword: rule.keyword,
      message: rule.message,
      severity: rule.severity == 0 ? 'info' : (rule.severity == 1 ? 'warning' : 'error')
    }));

    if (this.model.vertexCodeEditable) {
      this.vertexFile = createFileEditorInstance('vertex.glsl', 'x-shader/x-vertex', this.shaderProgram.vertex, rules);
      this.programFiles.push(this.vertexFile);
    }

    if (this.model.fragmentCodeEditable) {
      this.fragmentFile = createFileEditorInstance('fragment.glsl', 'x-shader/x-fragment', this.shaderProgram.fragment, rules);
      this.programFiles.push(this.fragmentFile);
    }
  }

  run(): void {
    if (this.handleLinterErrors()) {
      return;
    }

    this.vertexShaderApplied = this.getVertexCode();
    this.fragmentShaderApplied = this.getFragmentCode();
    this.compileTrigger++;
    this.isOutputHidden = false;
  }

  submit(): void {
    if (this.handleLinterErrors()) {
      return;
    }

    const taskSubmit: TaskSubmitDto = {
      id: this.model.id,
      vertexShader: this.getVertexCode(),
      fragmentShader: this.getFragmentCode(),
    }
    this.onSubmit.emit(taskSubmit);
  }

  handleLinterErrors(): boolean {
    const vertexErrors = this.vertexFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];
    const fragmentErrors = this.fragmentFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];

    if (this.vertexFile && vertexErrors.length > 0) {
      this.vertexFile?.setErrors(vertexErrors.map(e => ({ message: e.message, line: this.vertexFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (this.fragmentFile && fragmentErrors.length > 0) {
      this.fragmentFile?.setErrors(fragmentErrors.map(e => ({ message: e.message, line: this.fragmentFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (vertexErrors.length > 0 || fragmentErrors.length > 0) {
      this.hasCompilationError = true;
      // this.compilationStatusShown = true;
      // this.hideCompilationStatus$.next(true);

      this.snackBar.openFromComponent(CompilationErrorToastToastComponent, {
        horizontalPosition: 'right',
        verticalPosition: 'top',
        duration: 2000,
        panelClass: 'snack-bar-item-error'
      });

      return true;
    }

    return false;
  }

  getVertexCode() {
    return this.model.vertexCodeEditable ? (this.vertexFile?.state.doc.toString() || '') : this.shaderProgram.vertex;
  }

  getFragmentCode() {
    return this.model.fragmentCodeEditable ? (this.fragmentFile?.state.doc.toString() || '') : this.shaderProgram.fragment;
  }

  handleProgramCompilationError(errors: GlProgramErrors): void {
    this.vertexFile?.setErrors(errors.vertex.map(error => ({ ...error, type: 'error' } as FileError)));
    this.fragmentFile?.setErrors(errors.fragment.map(error => ({ ...error, type: 'error' } as FileError)));

    this.hasCompilationError = true;
    // this.compilationStatusShown = true;
    // this.hideCompilationStatus$.next(true);

    this.snackBar.openFromComponent(CompilationErrorToastToastComponent, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 2000,
      panelClass: 'snack-bar-item-error'
    });
  }

  handleProgramCompilationSuccess(): void {
    this.vertexFile?.setErrors([]);
    this.fragmentFile?.setErrors([]);

    this.hasCompilationError = false;
    // this.compilationStatusShown = true;
    // this.hideCompilationStatus$.next(true);

    this.snackBar.openFromComponent(CompilationSuccessToastComponent, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      duration: 2000,
      panelClass: 'snack-bar-item-success'
    });
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

  activateTab(tab: 'task' | 'theory' | 'answer') {
    this.activeTask = tab;
  }

  isActiveTab(tab: 'task' | 'theory' | 'answer'): boolean {
    return tab === this.activeTask;
  }

  hideCompilationStatus() {
    this.compilationStatusShown = false;
  }

  switchToNextTask() {
    if (this.isNextTaskAvailable) {
      this.onSwitchToNext.emit();
    }
  }

  switchToPrevTask() {
    if (this.isPrevTaskAvailable) {
      this.onSwitchToPrev.emit();
    }
  }

  toggleOutputVisibility() {
    this.isOutputHidden = !this.isOutputHidden;
  }

  ngOnDestroy(): void {
    if (this.vertexFile) {
      this.vertexFile.destroy();
    }

    if (this.fragmentFile) {
      this.fragmentFile.destroy();
    }

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
