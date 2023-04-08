export interface CodeEditorFile {
    name: string;
    data: string;
    mode: string;
    hasError?: boolean;
  }

export interface CodeEditorPrompts {
    [fileName: string]: CodeEditorPrompt[];
}

export interface CodeEditorPrompt {
    line: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    shaderType: string;
}

export interface CodeEditorOutput {
    message: string;
    type: 'error' | 'success';
}