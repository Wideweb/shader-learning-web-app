import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormBuilder, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DEFAULT_FRAGMENT_SHADER, DEFAULT_VERTEX_SHADER } from 'src/app/app.constants';
import { Task } from 'src/app/models/task.model';
import { Spinner } from 'src/app/services/spinner.service';
import { TaskService } from 'src/app/services/task.service';
import * as marked from 'marked';
import { MatTabChangeEvent } from '@angular/material/tabs';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.css']
})
export class TaskCreateComponent implements OnInit {
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

  public moduleId: number = -1;

  public id: number = -1;

  public task: Task | null = null;

  public compiledMarkdown: string = '';

  constructor(private taskService: TaskService, private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private spinner: Spinner) {
    this.form = this.fb.group({
      name: new FormControl('', [Validators.required]),
      cost: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
      threshold: new FormControl('', [Validators.required, Validators.pattern(/^([1-9]\d{0,1}|100)$/)]),
      description: new FormControl(this.getPlaceHolder(), [Validators.required]),
      visibility: false,
    });
  }

  ngOnInit(): void {
    this.moduleId = Number.parseInt(this.route.snapshot.params['moduleId']);
    this.id = this.route.snapshot.params['taskId'];
    if (this.id) {
      this.taskService.get(this.id).subscribe(task => {
        if (!task) {
          return;
        }

        this.task = task;
        this.form.patchValue({...task});
        this.vertexShader = task.vertexShader || DEFAULT_VERTEX_SHADER;
        this.fragmentShader = task.fragmentShader;
        this.fragmentShaderApplied = this.fragmentShader;
        this.compileTrigger++;
      });
    }
  }

  isNew() {
    return !this.id;
  }

  cancel() {
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
        this.form.setErrors({[e.error.code]: true})
        if (e.error.code == 'TASK_NAME_NOT_UNIQUE') {
          this.form.controls['name'].setErrors({'TASK_NAME_NOT_UNIQUE': true});
        }
      },
      next: () => this.router.navigate([`module/${this.moduleId}/edit`])
    });
  }

  doCreateRequest() {
    return this.taskService.create({
      name: this.form.value.name,
      hints: [],
      restrictions: [],
      cost: Number.parseInt(this.form.value.cost),
      threshold: Number.parseInt(this.form.value.threshold),
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      description: this.form.value.description as string,
      visibility: this.form.value.visibility,
      moduleId: this.moduleId
    })
  }

  doUpdateRequest() {
    return this.taskService.update({
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
      moduleId: this.moduleId
    })
  }

  run(): void {
    this.fragmentShaderApplied = this.fragmentShader;
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

  public compileMarkdown(): string {
    return marked.Parser.parse(marked.Lexer.lex(this.getPlaceHolder()));
  }

  private getPlaceHolder() {
    return (`# Title
## Title
### Title
#### Title

**bold**

*italic*

inline \`code\`

### code block
\`\`\`
const foo = () => {
  return 1;
}
\`\`\`

### unorderd list
- item 1
* item 2

### orderd list
1. item a
2. item b`
      );
  }
}
