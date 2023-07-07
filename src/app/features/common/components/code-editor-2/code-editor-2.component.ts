import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { CodeEditorLinterRule, FileEditorInstance, FileError } from './declarations';

@Component({
  selector: 'code-editor-2',
  templateUrl: './code-editor-2.component.html',
  styleUrls: ['./code-editor-2.component.scss']
})
export class CodeEditor2Component implements OnChanges {

  @ViewChild(CodemirrorComponent)
  public codemirror!: CodemirrorComponent;

  @Input()
  public files: FileEditorInstance[] = [];

  @Input()
  public errors: FileError[] = [];

  @Input()
  public rules: CodeEditorLinterRule[] = [];

  @ViewChild('editor') editorEl!: ElementRef;

  public currentFile: FileEditorInstance | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if ('files' in changes)
    {
      if (!this.files || this.files.length === 0)
      {
        this.currentFile = null;
        
      } else {
        this.currentFile = this.files[0];
      }
    }
  }

  public selectFile(file: FileEditorInstance) {
    this.currentFile = file;
  }

  public isSelected(file: FileEditorInstance) {
    return this.currentFile === file;
  }
}
