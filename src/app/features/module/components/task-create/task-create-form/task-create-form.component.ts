import { Component, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
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

  public vertexShader: string = DEFAULT_VERTEX_SHADER;

  public fragmentShader: string = DEFAULT_FRAGMENT_SHADER;

  public fragmentShaderApplied: string = this.fragmentShader;

  public compileTrigger = 0;

  public programOutput = {
    error: false,
    message: ''
  };

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
      channel1: null,
      channel2: null,
      animated: false,
      animationSteps: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
      animationStepTime: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
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
        animationStepsCtrl.addValidators(Validators.required);
        animationStepTimeCtrl.addValidators(Validators.required);
      } else {
        animationStepsCtrl.removeValidators(Validators.required);
        animationStepsCtrl.setValue('');
        
        animationStepTimeCtrl.removeValidators(Validators.required);
        animationStepTimeCtrl.setValue('');
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('task' in changes) {
      if (this.task) {
        console.log(this.task);
        this.form.patchValue({...this.task});
        this.vertexShader = this.task.vertexShader || DEFAULT_VERTEX_SHADER;
        this.fragmentShader = this.task.fragmentShader;
        this.fragmentShaderApplied = this.fragmentShader;
        this.compileTrigger++;

        if (this.task.channel1) {
          const reader = new FileReader();
          reader.onload = (e) => (this.preview1 = e.target?.result);
          reader.readAsDataURL(this.task.channel1 as File);
        }
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
      if (this.programOutput.error) {
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
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channel1: this.form.value.channel1,
      channel2: this.form.value.channel2,
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
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId!,
      channel1: this.form.value.channel1,
      channel2: this.form.value.channel2,
      animated: this.form.value.animated,
      animationSteps: this.form.value.animated ? Number.parseInt(this.form.value.animationSteps) : null,
      animationStepTime: this.form.value.animated ? Number.parseInt(this.form.value.animationStepTime) : null,
    }));
  }

  run(): void {
    this.fragmentShaderApplied = this.fragmentShader;
    this.compileTrigger++;
  }

  hanldeChannelChange(): void {
    this.compileTrigger++;
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

  public markdownTapChanged(event: MatTabChangeEvent) {
    if (event.index == 1) {
      this.compiledMarkdown = marked.Parser.parse(marked.Lexer.lex(this.form.value.description));
    }
  }

  public preview1: string | ArrayBuffer | null | undefined = null;
  public preview2: string | ArrayBuffer | null | undefined = null;


  selectFile1(event: Event): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if (!files  || files.length < 1) {
      return;
    }

    const file: File = files[0];

    const reader = new FileReader();
    reader.onload = (e) => (this.preview1 = e.target?.result);
    reader.readAsDataURL(file);

    this.form.get('channel1')?.setValue(file);
  }

  selectFile2(event: Event): void {
    const files: FileList | null = (event.target as HTMLInputElement).files;
    if (!files  || files.length < 1) {
      return;
    }

    const file: File = files[0];

    const reader = new FileReader();
    reader.onload = (e) => (this.preview2 = e.target?.result);
    reader.readAsDataURL(file);

    this.form.get('channel2')?.setValue(file);
  }
}
