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
import { CodeEditorFile, CodeEditorPrompt, CodeEditorPrompts } from 'src/app/features/common/components/code-editor/declarations';
import { GlProgramErrors } from 'src/app/features/common/components/gl-scene/gl-scene.component';
import { GlProgramChannel, GlScene } from 'src/app/features/common/gl-scene/models';
import { SceneSettingsFormComponent } from '../scene-settings-form/scene-settings-form.component';

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

  public glSceneSettings: GlScene = new GlScene();

  public taskProgramPrompts: CodeEditorPrompts = {};

  public taskProgram: CodeEditorFile[] = [
    { 
      name: 'vertex.glsl',
      data: DEFAULT_VERTEX_SHADER,
      mode: 'x-shader/x-vertex'
    },
    {
      name: 'fragment.glsl',
      data: DEFAULT_FRAGMENT_SHADER,
      mode: 'x-shader/x-fragment'
    }
  ];

  public taskVertexShaderApplied: string = DEFAULT_VERTEX_SHADER;

  public taskFragmentShaderApplied: string = DEFAULT_FRAGMENT_SHADER;
  
  public taskCompileTrigger = 0;


  public defaultVertexShaderApplied: string = DEFAULT_VERTEX_SHADER;

  public defaultFragmentShaderApplied: string = DEFAULT_FRAGMENT_SHADER;

  public defaultCompileTrigger = 0;

  public defaultProgramPrompts: CodeEditorPrompts = {};

  public defaultProgram: CodeEditorFile[] = [
    { 
      name: 'vertex.glsl',
      data: DEFAULT_VERTEX_SHADER,
      mode: 'x-shader/x-vertex'
    },
    {
      name: 'fragment.glsl',
      data: DEFAULT_FRAGMENT_SHADER,
      mode: 'x-shader/x-fragment'
    }
  ];

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes) {
      if (this.task) {
        this.channels.clear();
        this.task.channels.forEach(c => this.addChannel(c.file as File));

        this.form.patchValue({...this.task});

        const taskVertexShader = this.task.vertexShader || DEFAULT_VERTEX_SHADER;
        this.taskProgram.find(it => it.name == 'vertex.glsl')!.data = taskVertexShader;
        this.taskVertexShaderApplied = taskVertexShader;

        const taskFragmentShader = this.task.fragmentShader || DEFAULT_FRAGMENT_SHADER;
        this.taskProgram.find(it => it.name == 'fragment.glsl')!.data = taskFragmentShader;
        this.taskFragmentShaderApplied = taskFragmentShader;

        this.taskCompileTrigger++;

        const defaultVertexShader = this.task.defaultVertexShader || DEFAULT_VERTEX_SHADER;
        this.defaultProgram.find(it => it.name == 'vertex.glsl')!.data = defaultVertexShader;
        this.defaultVertexShaderApplied = defaultVertexShader;

        const defaultFragmentShader = this.task.defaultFragmentShader || DEFAULT_FRAGMENT_SHADER;
        this.defaultProgram.find(it => it.name == 'fragment.glsl')!.data = defaultFragmentShader;
        this.defaultFragmentShaderApplied = defaultFragmentShader;

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
      if ([
        ...Object.values(this.taskProgramPrompts).flat(),
        ...Object.values(this.defaultProgramPrompts).flat(),
      ].some(p => p.type == 'error')) {
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
      vertexShader: this.taskProgram.find(it => it.name === 'vertex.glsl')!.data,
      fragmentShader: this.taskProgram.find(it => it.name === 'fragment.glsl')!.data,
      defaultVertexShader: this.defaultProgram.find(it => it.name === 'vertex.glsl')!.data,
      defaultFragmentShader: this.defaultProgram.find(it => it.name === 'fragment.glsl')!.data,
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
      vertexShader: this.taskProgram.find(it => it.name === 'vertex.glsl')!.data,
      fragmentShader: this.taskProgram.find(it => it.name === 'fragment.glsl')!.data,
      defaultVertexShader: this.defaultProgram.find(it => it.name === 'vertex.glsl')!.data,
      defaultFragmentShader: this.defaultProgram.find(it => it.name === 'fragment.glsl')!.data,
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
    this.taskFragmentShaderApplied = this.taskProgram.find(it => it.name === 'fragment.glsl')!.data;
    this.taskVertexShaderApplied = this.taskProgram.find(it => it.name === 'vertex.glsl')!.data;
    this.taskCompileTrigger++;
  }

  handleTaskProgramCompilationError(errors: GlProgramErrors): void {
    this.taskProgramPrompts = {
      ['vertex.glsl']: errors.vertex.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
      ['fragment.glsl']: errors.fragment.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
    }
  }

  handleTaskProgramCompilationSuccess(): void {
    this.taskProgramPrompts = {};
  }

  handleTaskProgramFileChange(file: CodeEditorFile) {
    const fileToUpdate = this.taskProgram.find(it => it.name === file.name);
    if (fileToUpdate) {
      fileToUpdate.data = file.data
    }
  }

  ////////////////////////////////////////////////////////////////////////////////
  //////////////////////////// DEFAULT PROGRAM ///////////////////////////////////
  ////////////////////////////////////////////////////////////////////////////////

  runDefault(): void {
    this.defaultFragmentShaderApplied = this.defaultProgram.find(it => it.name === 'fragment.glsl')!.data;
    this.defaultVertexShaderApplied = this.defaultProgram.find(it => it.name === 'vertex.glsl')!.data;
    this.defaultCompileTrigger++;
  }

  handleDefaultProgramCompilationError(errors: GlProgramErrors): void {
    this.defaultProgramPrompts = {
      ['vertex.glsl']: errors.vertex.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
      ['fragment.glsl']: errors.fragment.map(error => ({ ...error, type: 'error' } as CodeEditorPrompt)),
    }
  }

  handleDefaultSProgramCompilationSuccess(): void {
    this.defaultProgramPrompts = {};
  }

  handleDefaultProgramFileChange(file: CodeEditorFile) {
    const fileToUpdate = this.defaultProgram.find(it => it.name === file.name);
    if (fileToUpdate) {
      fileToUpdate.data = file.data
    }
  }
}
