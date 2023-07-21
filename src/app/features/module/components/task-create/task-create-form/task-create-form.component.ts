import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';
import { Store } from '@ngxs/store';
import { TaskDto, TaskLinterRuleDto } from '../../../models/task.model';
import { TaskCreate, TaskUpdate } from '../../../state/task.actions';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { GlProgramErrors } from 'src/app/features/common/components/gl-scene/gl-scene.component';
import { GlProgramChannel, GlScene } from 'src/app/features/common/gl-scene/models';
import { SceneSettingsFormComponent } from '../scene-settings-form/scene-settings-form.component';
import { CodeEditorLinterRule, FileEditorInstance, FileError } from 'src/app/features/common/components/code-editor/declarations';
import { createFileEditorInstance } from 'src/app/features/common/components/code-editor/file-editor/file-editor-factory';
import { RuleFormComponent } from '../rule-form/rule-form.component';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'task-create-form',
  templateUrl: './task-create-form.component.html',
  styleUrls: ['./task-create-form.component.scss']
})
export class TaskCreateFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public moduleId: number | null = null;

  @Input()
  public task: TaskDto | null = null;

  public glProgramChannels: GlProgramChannel[] = [];

  public glSceneSettings: GlScene = new GlScene();


  private taskVertexFile: FileEditorInstance | null = null;

  private taskFragmentFile: FileEditorInstance | null = null;

  public taskProgramFiles: FileEditorInstance[] = [];

  public taskVertexShaderApplied: string = DEFAULT_VERTEX_SHADER;

  public taskFragmentShaderApplied: string = DEFAULT_FRAGMENT_SHADER;
  
  public taskCompileTrigger = 0;


  private defaultVertexFile: FileEditorInstance | null = null;

  private defaultFragmentFile: FileEditorInstance | null = null;

  public defaultProgramFiles: FileEditorInstance[] = [];

  public defaultVertexShaderApplied: string = DEFAULT_VERTEX_SHADER;

  public defaultFragmentShaderApplied: string = DEFAULT_FRAGMENT_SHADER;

  public defaultCompileTrigger = 0;
  

  public form: FormGroup;

  public matcher = new MyErrorStateMatcher();

  public compiledMarkdown: string = '';

  private destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private store: Store, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private spinner: SpinnerService) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
      threshold: new FormControl('', [Validators.required, Validators.pattern(/^([1-9]\d{0,1}|100)$/)]),
      description: new FormControl('', [Validators.required]),
      visibility: false,
      animated: false,
      animationSteps: new FormControl('', []),
      animationStepTime: new FormControl('', []),
      channels: this.fb.array([]),
      rules: this.fb.array([]),
      sceneSettings: SceneSettingsFormComponent.createForm(fb, this.destroy$),
      vertexCodeEditable: true,
      fragmentCodeEditable: true,
    });
  }
  
  ngOnInit(): void {
    this.form.get('animated')?.valueChanges.pipe(
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(animated => {
      const animationStepsCtrl =  this.form.get('animationSteps');
      const animationStepTimeCtrl =  this.form.get('animationStepTime');

      if (!animationStepsCtrl || !animationStepTimeCtrl) {
        return;
      }

      if (animated) {
        animationStepsCtrl.addValidators([Validators.required, Validators.pattern(/^[1-9]\d*$/)]);
        animationStepTimeCtrl.addValidators([Validators.required, Validators.pattern(/^[1-9]\d*$/)]);
      } else {
        animationStepsCtrl.clearValidators();
        animationStepsCtrl.setValue('');
        animationStepsCtrl.updateValueAndValidity();
        
        animationStepTimeCtrl.clearValidators();
        animationStepTimeCtrl.setValue('');
        animationStepsCtrl.updateValueAndValidity();
      }
    });

    this.form.get('channels')?.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe((channels) => (this.glProgramChannels = [...channels]));

    this.form.get('rules')?.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe((newRules: TaskLinterRuleDto[]) => {
      const rules: CodeEditorLinterRule[] = newRules.map((rule) => ({
        keyword: rule.keyword,
        message: rule.message,
        severity: rule.severity == 0 ? 'info' : (rule.severity == 1 ? 'warning' : 'error')
      }));

      this.taskVertexFile?.setLinterRules(rules);
      this.taskFragmentFile?.setLinterRules(rules);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes) {
      if (this.task) {
        this.channels.clear();
        this.task.channels.forEach(c => this.addChannel(c.file as File));
        
        this.rulesForms.clear();
        this.task.rules.forEach(rule => this.addRule(rule));

        this.form.patchValue({...this.task});

        const rules: CodeEditorLinterRule[] = this.task.rules.map((rule) => ({
          keyword: rule.keyword,
          message: rule.message,
          severity: rule.severity == 0 ? 'info' : (rule.severity == 1 ? 'warning' : 'error')
        }));

        const taskVertexShader = this.task.vertexShader || DEFAULT_VERTEX_SHADER;
        this.taskVertexFile = createFileEditorInstance('vertex.glsl', 'x-shader/x-vertex', taskVertexShader, rules);
        this.taskVertexShaderApplied = taskVertexShader;

        const taskFragmentShader = this.task.fragmentShader || DEFAULT_FRAGMENT_SHADER;
        this.taskFragmentFile = createFileEditorInstance('fragment.glsl', 'x-shader/x-fragment', taskFragmentShader, rules);
        this.taskFragmentShaderApplied = taskFragmentShader;
        
        this.taskProgramFiles = [this.taskVertexFile, this.taskFragmentFile];
        this.taskCompileTrigger++;


        const defaultVertexShader = this.task.defaultVertexShader || DEFAULT_VERTEX_SHADER;
        this.defaultVertexFile = createFileEditorInstance('vertex.glsl', 'x-shader/x-vertex', defaultVertexShader, []);
        this.defaultVertexShaderApplied = defaultVertexShader;

        const defaultFragmentShader = this.task.defaultFragmentShader || DEFAULT_FRAGMENT_SHADER;
        this.defaultFragmentFile = createFileEditorInstance('fragment.glsl', 'x-shader/x-fragment', defaultFragmentShader, []);
        this.defaultFragmentShaderApplied = defaultFragmentShader;

        this.defaultProgramFiles = [this.defaultVertexFile, this.defaultFragmentFile];
        this.defaultCompileTrigger++;
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  isNew() {
    return !this.task?.id;
  }

  async cancel() {
    this.router.navigate([`module/${this.moduleId}/edit`]);
  }

  save() {
    this.form.markAsDirty();
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.spinner.show();
    this.runTask();
    this.runDefault();
    setTimeout(() => {
      this.spinner.hide();

      if (this.taskVertexFile?.hasError || this.taskFragmentFile?.hasError) {
        return;
      }

      if (this.defaultVertexFile?.hasError || this.defaultFragmentFile?.hasError) {
        return;
      }

      this.proceedSave();
    }, 1000);
  }

  proceedSave() {
    this.form.setErrors({});

    const request = this.isNew() ? this.doCreateRequest() : this.doUpdateRequest();
    request.subscribe({
      error: (e) => {
        if (e.error.code == 'TASK_NAME_NOT_UNIQUE') {
          this.form.controls['name'].setErrors({'TASK_NAME_NOT_UNIQUE': true});
        }
      },
      next: () => this.router.navigate([`module/${this.moduleId}/edit`])
    });
  }

  doCreateRequest() {
    return this.store.dispatch(new TaskCreate({
      id: undefined,
      name: this.form.value.name,
      hints: [],
      restrictions: [],
      cost: Number.parseInt(this.form.value.cost),
      threshold: Number.parseInt(this.form.value.threshold),
      vertexShader: this.taskVertexFile?.state.doc.toString() || '',
      fragmentShader: this.taskFragmentFile?.state.doc.toString() || '',
      defaultVertexShader: this.defaultVertexFile?.state.doc.toString() || '',
      defaultFragmentShader: this.defaultFragmentFile?.state.doc.toString() || '',
      vertexCodeEditable: this.form.value.vertexCodeEditable,
      fragmentCodeEditable: this.form.value.fragmentCodeEditable,
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channels: this.channels.controls.map((c) => ({ file: c.value.file })),
      animated: this.form.value.animated,
      animationSteps: this.form.value.animated ? Number.parseInt(this.form.value.animationSteps) : null,
      animationStepTime: this.form.value.animated ? Number.parseInt(this.form.value.animationStepTime) : null,
      sceneSettings: this.form.value.sceneSettings,
      rules: this.rulesForms.controls.map(c => ({
        id: c.value.id as number,
        default: false,
        keyword: c.value.keyword as string,
        message: c.value.message as string,
        severity: c.value.severity as number,
      }))
    }));
  }

  doUpdateRequest() {
    return this.store.dispatch(new TaskUpdate({
      id: this.task!.id,
      name: this.form.value.name,
      hints: this.task!.hints,
      restrictions: this.task!.restrictions,
      cost: Number.parseInt(this.form.value.cost),
      threshold: Number.parseInt(this.form.value.threshold),
      vertexShader: this.taskVertexFile?.state.doc.toString() || '',
      fragmentShader: this.taskFragmentFile?.state.doc.toString() || '',
      defaultVertexShader: this.defaultVertexFile?.state.doc.toString() || '',
      defaultFragmentShader: this.defaultFragmentFile?.state.doc.toString() || '',
      vertexCodeEditable: this.form.value.vertexCodeEditable,
      fragmentCodeEditable: this.form.value.fragmentCodeEditable,
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channels: this.channels.controls.map((c) => ({ file: c.value.file })),
      animated: this.form.value.animated,
      animationSteps: this.form.value.animated ? Number.parseInt(this.form.value.animationSteps) : null,
      animationStepTime: this.form.value.animated ? Number.parseInt(this.form.value.animationStepTime) : null,
      sceneSettings: this.form.value.sceneSettings,
      rules: this.rulesForms.controls.map(c => ({
        id: c.value.id as number,
        default: false,
        keyword: c.value.keyword as string,
        message: c.value.message as string,
        severity: c.value.severity as number,
      }))
    }));
  }

  hanldeChannelChange(): void {
    this.taskCompileTrigger++;
    this.defaultCompileTrigger++;
  }

  public markdownTapChanged(event: MatTabChangeEvent) {
    if (event.index == 1) {
      this.compiledMarkdown = marked.Parser.parse(marked.Lexer.lex(this.form.value.description));
    }
  }

  get rulesForms() {
    return this.form.controls["rules"] as FormArray<FormGroup>;
  }

  addRule(rule: TaskLinterRuleDto | null = null) {
    this.rulesForms.push(RuleFormComponent.createForm(this.fb, rule?.id, rule?.keyword, rule?.message, rule?.severity));
    this.hanldeChannelChange();
  }

  get channels() {
    return this.form.controls["channels"] as FormArray<FormGroup>;
  }

  addChannel(file: File | null) {
    if (!file) {
      return;
    }

    const channelForm = this.fb.group({
      file: [file, Validators.required],
    });
  
    this.channels.push(channelForm);
    this.hanldeChannelChange();
  }

  removeChannel(index: number) {
    this.channels.removeAt(index);
    this.hanldeChannelChange();
  }

  ////////////////////////////////////////////////////////////////////////////////
  ////////////////////////////// TASK PROGRAM ////////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  runTask(): void {
    if (this.handleTaskLinterErrors()) {
      return;
    }

    this.taskVertexShaderApplied = this.taskVertexFile?.state.doc.toString() || '';
    this.taskFragmentShaderApplied = this.taskFragmentFile?.state.doc.toString() || '';
    this.taskCompileTrigger++;
  }

  handleTaskLinterErrors(): boolean {
    const vertexErrors = this.taskVertexFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];
    const fragmentErrors = this.taskFragmentFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];

    if (this.taskVertexFile && vertexErrors.length > 0) {
      this.taskVertexFile?.setErrors(vertexErrors.map(e => ({ message: e.message, line: this.taskVertexFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (this.taskFragmentFile && fragmentErrors.length > 0) {
      this.taskFragmentFile?.setErrors(fragmentErrors.map(e => ({ message: e.message, line: this.taskFragmentFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (vertexErrors.length > 0 || fragmentErrors.length > 0) {
      return true;
    }

    return false;
  }

  handleTaskProgramCompilationError(errors: GlProgramErrors): void {
    this.taskVertexFile?.setErrors(errors.vertex.map(error => ({ ...error, type: 'error' } as FileError)));
    this.taskFragmentFile?.setErrors(errors.fragment.map(error => ({ ...error, type: 'error' } as FileError)));
  }

  handleTaskProgramCompilationSuccess(): void {
    this.taskVertexFile?.setErrors([]);
    this.taskFragmentFile?.setErrors([]);
  }

  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// DEFAULT PROGRAM ///////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  runDefault(): void {
    if (this.handleTaskLinterErrors()) {
      return;
    }

    this.defaultVertexShaderApplied = this.defaultVertexFile?.state.doc.toString() || '';
    this.defaultFragmentShaderApplied= this.defaultFragmentFile?.state.doc.toString() || '';
    this.defaultCompileTrigger++;
  }

  handleDefaultLinterErrors(): boolean {
    const vertexErrors = this.defaultVertexFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];
    const fragmentErrors = this.taskFragmentFile?.linterDiagnostics.filter(d => d.severity === 'error') || [];

    if (this.defaultVertexFile && vertexErrors.length > 0) {
      this.defaultVertexFile?.setErrors(vertexErrors.map(e => ({ message: e.message, line: this.defaultVertexFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (this.defaultFragmentFile && fragmentErrors.length > 0) {
      this.defaultFragmentFile?.setErrors(fragmentErrors.map(e => ({ message: e.message, line: this.defaultFragmentFile!.state.doc.lineAt(e.from).number - 1 })))
    }

    if (vertexErrors.length > 0 || fragmentErrors.length > 0) {
      return true;
    }

    return false;
  }

  handleDefaultProgramCompilationError(errors: GlProgramErrors): void {
    this.defaultVertexFile?.setErrors(errors.vertex.map(error => ({ ...error, type: 'error' } as FileError)));
    this.defaultFragmentFile?.setErrors(errors.fragment.map(error => ({ ...error, type: 'error' } as FileError)));
  }

  handleDefaultSProgramCompilationSuccess(): void {
    this.defaultVertexFile?.setErrors([]);
    this.defaultFragmentFile?.setErrors([]);
  }
}
