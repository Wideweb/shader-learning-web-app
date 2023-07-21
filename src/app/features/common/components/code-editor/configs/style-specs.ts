import { toRem } from "../../../services/utils";

const styleSpecs = {
    '&': {
        color: '#575757',
        backgroundColor: '#F3F5FB',
        height: '100%',
    },
    '.cm-content': {
        fontFamily: 'Cutive Mono Regular, Source Code Pro, monospace',
        fontSize: toRem(16),
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: toRem(24),
        caretColor: '#1F1F1F'
    },
    '.cm-line': {
        padding: `${toRem(0)} ${toRem(8)}`,
    },
    '&.cm-focused': {
        outline: 'none',
    },
    '&.cm-focused .cm-cursor': {
        borderLeftColor: '#1F1F1F'
    },
    // '&.cm-focused .cm-selectionBackground, ::selection': {
    //   backgroundColor: '#074'
    // },
    '.cm-gutters': {
        fontFamily: 'Avenir Next LT Pro Regular',
        lineHeight: toRem(20),
        fontSize: toRem(14),
        fontWeight: 400,
        backgroundColor: '#E4E8FA',
        color: '#4F6AF4',
        border: 'none',
    },
    '.cm-gutter.cm-lineNumbers .cm-gutterElement': {
        width: toRem(35),
        boxSizing: 'border-box',
        padding: `${toRem(2)} ${toRem(8)} 0 0`,
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
        backgroundColor: '#FFAA7A',
    },
    '.cm-scroller': {
        flex: 1
    },

    '.cm-tooltip-autocomplete': {
        border: 'none',
        borderRadius: toRem(6),
        overflow: 'hidden',
        background: '#E4E8FA',
    },
    '.cm-completionIcon': {
        display: 'none',
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul': {
        maxHeight: toRem(164),
        fontFamily: 'Cutive Mono Regular, Source Code Pro, monospace',
        fontSize: toRem(16),
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: toRem(24),
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li': {
        color: '#575757',
        boxSizing: 'border-box',
        padding: `${toRem(4)} ${toRem(20)} ${toRem(4)} ${toRem(8)}`,
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li:first-child': {
        paddingTop: toRem(4),
    },
    '.cm-tooltip.cm-tooltip-autocomplete > ul > li:last-child': {
        paddingBottom: toRem(4),
    },
    '.cm-tooltip-autocomplete ul li[aria-selected]': {
        background: '#3E54C2',
        color: '#FAFAFA',
    },

    '.cm-tooltip': {
        border: 'none',
        backgroundColor: 'none',
    },
    '.cm-diagnostic': {
        borderRadius: toRem(6),
        fontFamily: 'Avenir Next LT Pro Regular',
        lineHeight: toRem(20),
        fontSize: toRem(14),
        fontWeight: 400,
        backgroundColor: '#FAFAFA',
        boxSizing: 'border-box',
        padding: `${toRem(3)} ${toRem(6)}`,
    },
    '.cm-diagnostic-error': {
        border: `${toRem(1)} solid #F44F4F`,
        color: '#F44F4F',
    },
    '.cm-diagnostic-warning': {
        border: `${toRem(1)} solid #FFAA7A`,
        color: '#FFAA7A',
    },
    // '.ͼ1 .cm-completionIcon-keyword:after'
  }

  export default styleSpecs;