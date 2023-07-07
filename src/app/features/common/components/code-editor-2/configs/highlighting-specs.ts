import { defaultHighlightStyle } from "@codemirror/language"
import { tags } from "@lezer/highlight"

const highlightingSpecs = [
  ...defaultHighlightStyle.specs,
  { tag: tags.standard(tags.variableName), color: "#221199" },
];

export default highlightingSpecs;