import { Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild, } from '@angular/core';
import { CodemirrorComponent } from '@ctrl/ngx-codemirror';
import { FileEditorInstance, FileError } from './declarations';

@Component({
  selector: 'code-editor',
  templateUrl: './code-editor.component.html',
  styleUrls: ['./code-editor.component.scss']
})
export class CodeEditorComponent implements OnChanges {

  @ViewChild(CodemirrorComponent)
  public codemirror!: CodemirrorComponent;

  @Input()
  public files: FileEditorInstance[] = [];

  @Input()
  public errors: FileError[] = [];

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
