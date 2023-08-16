import { syntaxHighlighting, StreamLanguage, HighlightStyle } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import { EditorView } from "@codemirror/view"
import { shader } from "@codemirror/legacy-modes/mode/clike"
import styleSpecs from "../configs/style-specs"
import highlightingSpecs from "../configs/highlighting-specs"
import { FileViewInstance } from "../declarations"

export const createFileViewInstance = (
    name: string,
    mode: string,
    doc: string,
    ): FileViewInstance => {

    const state = EditorState.create({
        doc,
        extensions: [
            EditorView.theme(styleSpecs),
            EditorView.lineWrapping,
            EditorState.tabSize.of(8),
            EditorState.readOnly.of(true),
            StreamLanguage.define(shader),
            syntaxHighlighting(HighlightStyle.define(highlightingSpecs)),
        ],
    });

    return new FileViewInstance(name, mode, state);
}