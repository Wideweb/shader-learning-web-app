import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands"
import { syntaxHighlighting, StreamLanguage, HighlightStyle } from "@codemirror/language"
import { Diagnostic, lintGutter, lintKeymap } from "@codemirror/lint"
import { Compartment, EditorState } from "@codemirror/state"
import { EditorView, ViewPlugin, ViewUpdate, keymap, lineNumbers } from "@codemirror/view"
import { glslCompletions } from "../configs/glsl-completions"
import { autocompletion, closeBrackets } from "@codemirror/autocomplete"
import { highlightSelectionMatches } from "@codemirror/search"
import { lints } from "../configs/linter"
import { shader } from "@codemirror/legacy-modes/mode/clike"
import styleSpecs from "../configs/style-specs"
import highlightingSpecs from "../configs/highlighting-specs"
import { CodeEditorLinterRule, FileEditorInstance } from "../declarations"
import { decorations } from "../configs/line-decorations"

export const createFileEditorInstance = (
    name: string,
    mode: string,
    doc: string,
    rules: CodeEditorLinterRule[],
    ): FileEditorInstance => {

    const linter = new Compartment;

    const instance = new FileEditorInstance(name, mode, null as any, { linter });
    instance.setLinterRules(rules);
    
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
            history(),
            syntaxHighlighting(HighlightStyle.define(highlightingSpecs)),
            lintGutter(),
            lineNumbers(),

            // search({ top: true }),
            highlightSelectionMatches(),
            closeBrackets(),


            linter.of(lints(instance, { delay: 100 }, (diagnostics: Diagnostic[]) => instance.setLinterDiagnostics(diagnostics))),
            decorations,

            ViewPlugin.fromClass(class {
                constructor(private view: EditorView) {}
  
                update(update: ViewUpdate) {
                    
                    if (update.docChanged || update.geometryChanged) {
                        update.changes.iterChanges((fromA: number, toA: number, fromB: number, toB: number) => {
                            const docLength = this.view.state.doc.length;
                            
                            const fromALine = fromA <= docLength ? this.view.state.doc.lineAt(fromA).number : docLength;
                            const toALine = toA <= docLength ? this.view.state.doc.lineAt(toA).number : docLength;

                            if (update.geometryChanged)
                            {
                                setTimeout(() => instance.removeErrors(fromALine - 1, Number.MAX_VALUE), 0);
                            }
                            else
                            {
                                setTimeout(() => instance.removeErrors(fromALine - 1, toALine - 1), 0);
                            }
                        });
                        instance.changeDocument(this.view);
                    } 
                }
            }),
        ],
    });

    instance.state = state;
    return instance;
}