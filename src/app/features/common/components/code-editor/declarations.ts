export interface CodeEditorPrompt {
    line: number;
    type: 'error' | 'warning' | 'info';
    message: string;
}

export interface CodeEditorOutput {
    message: string;
    type: 'error' | 'success';
}