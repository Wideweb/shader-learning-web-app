import { Component, Input, Output, EventEmitter} from '@angular/core';
import { Task, TaskSubmit, TaskHint } from 'src/app/models/task.model';

@Component({
  selector: 'task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent {
  @Input()
  public model!: Task;

  @Output()
  public onSubmit = new EventEmitter<TaskSubmit>();

  public visibleHints: TaskHint[] = [];

  public userVertexShader: string = `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  public userFragmentShader: string = 
`uniform vec2 iResolution;
uniform float iTime;

void main() {
  // Normalized pixel coordinates (from 0 to 1)
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
}`;

  public userFragmentShaderApplied: string = this.userFragmentShader;

  public programOutput = {
    error: false,
    message: ''
  };

  public compileTrigger = 0;

  run(): void {
    this.userFragmentShaderApplied = this.userFragmentShader;
    this.compileTrigger++;
  }

  submit(): void {
    const taskSubmit: TaskSubmit = {
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

  revealHint(hint: TaskHint) {
    this.visibleHints.push(hint);
  }

  isHintRevealed(hint: TaskHint) {
    return this.visibleHints.includes(hint);
  }
}
