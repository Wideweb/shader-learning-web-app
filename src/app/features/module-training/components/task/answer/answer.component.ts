import { Component, Input, SimpleChanges } from '@angular/core';
import { FileViewInstance } from 'src/app/features/common/components/code-editor/declarations';
import { createFileViewInstance } from 'src/app/features/common/components/code-editor/file-view/file-view-factory';
import { TaskDto } from 'src/app/features/module-training-common/models/task.model';

@Component({
  selector: 'task-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.scss']
})
export class TaskAnswerComponent {
  @Input()
  public model!: TaskDto;

  public vertexFile: FileViewInstance | null = null;

  public fragmentFile: FileViewInstance | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('model' in changes) {
      this.createProgramFiles();
    }
  }

  createProgramFiles() {
    if (this.model.vertexCodeEditable) {
      this.vertexFile = createFileViewInstance('vertex.glsl', 'x-shader/x-vertex', this.model.vertexShader);
    }

    if (this.model.fragmentCodeEditable) {
      this.fragmentFile = createFileViewInstance('fragment.glsl', 'x-shader/x-fragment', this.model.fragmentShader);
    }
  }
}
