import { EditorState, Range, RangeSet, StateField } from "@codemirror/state";
import {Decoration, DecorationSet, EditorView, WidgetType} from "@codemirror/view"
import { FileError } from "../declarations";

class LineErrorWidget extends WidgetType {
    constructor(private message: string) { super() }
  
    override eq(other: LineErrorWidget) { return other.message === this.message; }
  
    toDOM() {
      let wrap = document.createElement("div");
      wrap.textContent = this.message;
      wrap.style.backgroundColor = '#F44F4F';
      wrap.style.color = '#FAFAFA';
      return wrap;
    }
  
    override ignoreEvent() { return false }
  }

const decorate = (state: EditorState, errors: FileError[]) => {
    const widgets: Range<Decoration>[] = [];
    for (let i = 0; i < errors.length; i++) {
        const error = errors[i];
        const widget = Decoration.widget({
            widget: new LineErrorWidget(error.message),
            // inclusiveStart: true,
            // inclusiveEnd: true,
            // from: state.doc.line(error.line).from,
            // to: state.doc.line(5).to,
            side: -1,
            block: true,
        });

        widgets.push(widget.range(state.doc.line(error.line).from));
    }
    
    return widgets.length > 0 ? RangeSet.of(widgets) : Decoration.none
}

export const lineError = (errors: FileError[]) => StateField.define<DecorationSet>({
    create(state) {
        return decorate(state, errors)
    },

    update(images, transaction) {
      if (transaction.docChanged) {
          return decorate(transaction.state, errors);
      }

        return images.map(transaction.changes);
    },

    provide(field) {
        return EditorView.decorations.from(field)
    },
})