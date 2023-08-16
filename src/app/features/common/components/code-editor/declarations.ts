import { Diagnostic } from "@codemirror/lint";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { BehaviorSubject, Observable, Subject } from "rxjs";

export interface CodeEditorFile {
    name: string;
    data: string;
    mode: string;
    hasError?: boolean;
}

export interface FileEditorConfigs {
    linter: Compartment,
}

export interface FileError {
    line: number;
    message: string;
}

export class FileEditorInstance {
    public name: string;
    
    public mode: string;
    
    public state: EditorState;

    public errors: FileError[] = [];

    public linterDiagnostics: Diagnostic[] = [];
    
    public configs: FileEditorConfigs;

    public errors$: Observable<FileError[]>;

    public documentChanged$: Observable<EditorView>;

    public rules: CodeEditorLinterRule[] = [];

    private setErrors$ = new BehaviorSubject<FileError[]>([]);

    private changeDocument$ = new Subject<EditorView>();

    constructor(name: string, mode: string, state: EditorState, configs: FileEditorConfigs) {
        this.name = name;
        this.mode = mode;
        this.state = state;
        this.configs = configs;
        this.documentChanged$ = this.changeDocument$.asObservable();
        this.errors$ = this.setErrors$.asObservable();
    }

    public get hasError() {
        return (this.errors && this.errors.length > 0) || (this.linterDiagnostics && this.linterDiagnostics.some(d => d.severity === 'error'));
    } 

    public changeDocument(view: EditorView) {
        this.state = view.state;
        this.changeDocument$.next(view);
    }

    public setLinterRules(rules: CodeEditorLinterRule[]) {
        this.rules = rules;
    }
    
    public setErrors(errors: FileError[]): void {
        this.errors = errors;
        this.setErrors$.next(errors);
    }

    public setLinterDiagnostics(diagnostics: Diagnostic[]): void {
        this.linterDiagnostics = diagnostics;
    }

    public removeErrors(fromLine: number, toLine: number): void {
        this.setErrors(this.errors.filter(e => e.line < fromLine || e.line > toLine));
    }

    public moveErrors(fromLine: number, delta: number): void {
        this.setErrors(this.errors.map(e => ({...e, line: e.line + (e.line < fromLine ? 0 : delta)})));
    }

    public destroy() {
        this.changeDocument$.unsubscribe();
        this.setErrors$.unsubscribe();
    }
};

export class FileViewInstance {
    public name: string;
    
    public mode: string;
    
    public state: EditorState;

    constructor(name: string, mode: string, state: EditorState) {
        this.name = name;
        this.mode = mode;
        this.state = state;
    }
};

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

export interface CodeEditorLinterRule {
    keyword: string;
    message: string;
    severity: 'info' | 'warning' | 'error';
}