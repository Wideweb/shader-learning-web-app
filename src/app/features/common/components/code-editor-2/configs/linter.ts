import { EditorView } from '@codemirror/view';
import { syntaxTree } from "@codemirror/language"
import { linter, Diagnostic } from "@codemirror/lint"
import { FileEditorInstance } from '../declarations';

export const lints = (instance: FileEditorInstance, config?: {delay: number}, onViolation?: (diagnostics: Diagnostic[]) => void) => linter((view: EditorView) => {
    const docStr = view.state.doc.toString();
    let diagnostics: Diagnostic[] = []
    
    syntaxTree(view.state).cursor().iterate(node => {
        if (node.name !== 'keyword' && node.name !== 'variableName.standard') {
            return;
        }

        const word = docStr.substring(node.from, node.to);

        const violation = instance.rules.find(rule => rule.keyword === word);
        if (!violation) {
            return;
        }

        diagnostics.push({
            from: node.from,
            to: node.to,
            severity: violation.severity,
            message: violation.message
        });
    });

    if (onViolation) {
        onViolation(diagnostics);
    }
    
    return diagnostics;
}, config);