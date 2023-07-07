import * as CodeMirror from 'codemirror';

const WRAP_CLASS = 'CodeMirror-activeline';
const BACK_CLASS = 'CodeMirror-activeline-background';
const GUTT_CLASS = 'CodeMirror-activeline-gutter';

export default function activeLineSelection() {
  CodeMirror.defineOption('styleActiveLine', false, (cm: CodeMirror.Editor, val, prev) => {
    if (val == prev) {
      return;
    }

    if (prev) {
      cm.off('beforeSelectionChange', selectionChange);
      clearActiveLines(cm);
      delete cm.state.activeLines;
    }

    if (val) {
      cm.state.activeLines = [];
      updateActiveLines(cm, cm.listSelections());
      cm.on('beforeSelectionChange', selectionChange);
    }
  });
};

function clearActiveLines(cm: CodeMirror.Editor) {
  if (!cm.state.activeLines) {
      return;
  }

  for (let i = 0; i < cm.state.activeLines.length; i++) {
    cm.removeLineClass(cm.state.activeLines[i], 'wrap', WRAP_CLASS);
    cm.removeLineClass(cm.state.activeLines[i], 'background', BACK_CLASS);
    cm.removeLineClass(cm.state.activeLines[i], 'gutter', GUTT_CLASS);
  }
}

function sameArray(a: any[], b: any[]) {
  if (a.length != b.length) {
      return false;
  }

  for (let i = 0; i < a.length; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }

  return true;
}

function updateActiveLines(cm: CodeMirror.Editor, ranges: CodeMirror.Range[]) {
  const active: number[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    const option = (cm as any).getOption('styleActiveLine');
    
    if (typeof option == 'object' && option.nonEmpty ? range.anchor.line != range.head.line : !range.empty()) {
      continue
    }

    const line = (cm as any).getLineHandleVisualStart(range.head.line);
    if (active[active.length - 1] != line) {
      active.push(line);
    }
  }

  if (sameArray(cm.state.activeLines, active)) {
      return;
  }
  
  cm.operation(() => {
    clearActiveLines(cm);
    for (let i = 0; i < active.length; i++) {
      cm.addLineClass(active[i], 'wrap', WRAP_CLASS);
      cm.addLineClass(active[i], 'background', BACK_CLASS);
      cm.addLineClass(active[i], 'gutter', GUTT_CLASS);
    }
    cm.state.activeLines = active;
  });
}

function selectionChange(cm: CodeMirror.Editor, sel: CodeMirror.EditorSelectionChange) {
  updateActiveLines(cm, sel.ranges);
}