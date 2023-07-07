import { toRem } from "../../../services/utils";

const styleSpecs = {
    '&': {
        color: '#3F3A5A',
        backgroundColor: '#FAFAFA',
        height: '100%',
        minHeight: toRem(300),
    },
    '.cm-content': {
        fontFamily: 'Source Code Pro, monospace',
        fontSize: toRem(15),
        lineHeight: toRem(24),
        caretColor: 'black'
    },
    '&.cm-focused': {
        outline: 'none',
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: 'black'
    },
    // '&.cm-focused .cm-selectionBackground, ::selection': {
    //   backgroundColor: '#074'
    // },
    '.cm-gutters': {
        fontFamily: 'Source Code Pro, monospace',
        fontSize: toRem(15),
        lineHeight: toRem(24),
        backgroundColor: '#E4E8FA',
        color: '#4F6AF4',
        border: 'none',
    },
    '.cm-gutter.cm-lineNumbers .cm-gutterElement': {
        width: toRem(35),
        padding: 0,
        paddingRight: toRem(8),
    },
    '.cm-gutter.cm-gutter-lint': {
        width: toRem(9),
    },
    '.cm-gutter-lint .cm-gutterElement': {
        padding: 0,
        height: toRem(100),
    },
    '.cm-lint-marker': {
        paddingTop: toRem(1),
        width: toRem(2),
        height: toRem(22),
        content: 'none',
    },
    '.cm-lint-marker-error': {
        backgroundColor: '#F44F4F',
    },
    '.cm-lint-marker-warning': {
        backgroundColor: 'orange',
    },
    '.cm-scroller': {
        flex: 1
    }
    // '.ͼ1 .cm-completionIcon-keyword:after'
  }

  export default styleSpecs;