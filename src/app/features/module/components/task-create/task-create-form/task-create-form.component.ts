import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/features/app/app.constants';
import * as marked from 'marked';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SpinnerService } from 'src/app/features/common/services/spinner.service';
import { Store } from '@ngxs/store';
import { TaskDto } from '../../../models/task.model';
import { TaskCreate, TaskUpdate } from '../../../state/task.actions';
import { distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { GlProgramChannel } from 'src/app/features/common/services/gl.service';
import { CodeEditorPrompt } from 'src/app/features/common/components/code-editor/declarations';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'task-create-form',
  templateUrl: './task-create-form.component.html',
  styleUrls: ['./task-create-form.component.css']
})
export class TaskCreateFormComponent implements OnInit, OnChanges, OnDestroy {
  @Input()
  public moduleId: number | null = null;

  @Input()
  public task: TaskDto | null = null;

  public glProgramChannels: GlProgramChannel[] = [];


  public vertexShader: string = DEFAULT_VERTEX_SHADER;

  public fragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public fragmentShaderApplied: string = this.fragmentShader;

  public compileTrigger = 0;

  public programPrompts: CodeEditorPrompt[] = [];


  public defaultFragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public defaultFragmentShaderApplied: string = this.defaultFragmentShader;

  public defaultCompileTrigger = 0;

  public defaultProgramPrompts: CodeEditorPrompt[] = [];


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
      useDefaultFragmentShader: false,
      visibility: false,
      animated: false,
      animationSteps: new FormControl('', []),
      animationStepTime: new FormControl('', []),
      channels: this.fb.array([])
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes) {
      if (this.task) {
        this.channels.clear();
        this.task.channels.forEach(c => this.addChannel(c.file as File));

        this.form.patchValue({...this.task});
        this.vertexShader = this.task.vertexShader || DEFAULT_VERTEX_SHADER;
        this.fragmentShader = this.task.fragmentShader;
        this.fragmentShaderApplied = this.fragmentShader;
        this.compileTrigger++;

        this.defaultFragmentShader = this.task.defaultFragmentShader || DEFAULT_FRAGMENT_SHADER;
        this.defaultFragmentShaderApplied = this.defaultFragmentShader;
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
    this.run();
    setTimeout(() => {
      this.spinner.hide();
      if (this.programPrompts.some(p => p.type == 'error')) {
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
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      useDefaultFragmentShader: this.form.value.useDefaultFragmentShader,
      defaultFragmentShader: this.defaultFragmentShader,
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channels: this.channels.controls.map((c) => ({ file: c.value.file })),
      animated: this.form.value.animated,
      animationSteps: this.form.value.animated ? Number.parseInt(this.form.value.animationSteps) : null,
      animationStepTime: this.form.value.animated ? Number.parseInt(this.form.value.animationStepTime) : null,
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
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      useDefaultFragmentShader: this.form.value.useDefaultFragmentShader,
      defaultFragmentShader: this.defaultFragmentShader,
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channels: this.channels.controls.map((c) => ({ file: c.value.file })),
      animated: this.form.value.animated,
      animationSteps: this.form.value.animated ? Number.parseInt(this.form.value.animationSteps) : null,
      animationStepTime: this.form.value.animated ? Number.parseInt(this.form.value.animationStepTime) : null,
    }));
  }

  hanldeChannelChange(): void {
    this.compileTrigger++;
    this.defaultCompileTrigger++;
  }

  public markdownTapChanged(event: MatTabChangeEvent) {
    if (event.index == 1) {
      this.compiledMarkdown = marked.Parser.parse(marked.Lexer.lex(this.form.value.description));
    }
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

  run(): void {
    this.fragmentShaderApplied = this.fragmentShader;
    this.compileTrigger++;
  }

  handleCodeChange(code: string) {
    this.fragmentShader = code;
  }

  handleFragmentShaderCompilationError(errors: {line: number; message: string}[]): void {
    this.programPrompts = errors.map(error => ({ line: error.line, message: error.message, type: 'error' }));
  }

  handleFragmentShaderCompilationSuccess(): void {
    this.programPrompts = [];
  }

  runDefault(): void {
    this.defaultFragmentShaderApplied = this.defaultFragmentShader;
    this.defaultCompileTrigger++;
  }

  handleDefaultCodeChange(code: string) {
    this.defaultFragmentShader = code;
  }

  handleDefaultFragmentShaderCompilationError(errors: {line: number; message: string}[]): void {
    this.defaultProgramPrompts = errors.map(error => ({ line: error.line, message: error.message, type: 'error' }));
  }

  handleDefaultFragmentShaderCompilationSuccess(): void {
    this.defaultProgramPrompts = [];
  }
}
