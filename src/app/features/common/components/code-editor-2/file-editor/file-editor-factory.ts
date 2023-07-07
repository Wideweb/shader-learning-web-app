import { defaultKeymap, historyKeymap, indentWithTab } from "@codemirror/commands"
import { syntaxHighlighting, StreamLanguage, HighlightStyle } from "@codemirror/language"
import { Diagnostic, lintGutter, lintKeymap } from "@codemirror/lint"
import { Compartment, EditorState } from "@codemirror/state"
import { EditorView, ViewPlugin, keymap, lineNumbers } from "@codemirror/view"
import { glslCompletions } from "../configs/glsl-completions"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { highlightSelectionMatches } from "@codemirror/search"
import { lints } from "../configs/linter"
import { shader } from "@codemirror/legacy-modes/mode/clike"
import styleSpecs from "../configs/style-specs"
import highlightingSpecs from "../configs/highlighting-specs"
import { CodeEditorLinterRule, FileEditorInstance } from "../declarations"
import { lineError } from "../configs/line-error"

export const createFileEditorInstance = (
    name: string,
    mode: string,
    doc: string,
    rules: CodeEditorLinterRule[],
    ): FileEditorInstance => {

    const linter = new Compartment;
    const errors = new Compartment;

    const instance = new FileEditorInstance(name, mode, null as any, { linter, errors });
    const state = EditorState.create({
        doc,
        extensions: [
            EditorView.theme(styleSpecs),
            EditorState.tabSize.of(8),
            
            keymap.of([
                ...defaultKeymap,
                ...lintKeymap,
                // ...searchKeymap,
                ...historyKeymap,
                indentWithTab,
            ]),
            StreamLanguage.define(shader),
            autocompletion({override: [glslCompletions]}),
            
            syntaxHighlighting(HighlightStyle.define(highlightingSpecs)),
            lintGutter(),
            lineNumbers(),

            linter.of(lints(rules || [], { delay: 100 }, (diagnostics: Diagnostic[]) => instance.setLinterDiagnostics(diagnostics))),
            errors.of(lineError([])),

            // search({ top: true }),
            highlightSelectionMatches(),
            closeBrackets(),
            ViewPlugin.fromClass(class {
                constructor(private view: EditorView) {}
  
                update(update: any) {
                    if (update.docChanged) {
                        instance.changeDocument(this.view);
                    } 
                }
              }),
        ],
    });

    instance.state = state;
    return instance;
}