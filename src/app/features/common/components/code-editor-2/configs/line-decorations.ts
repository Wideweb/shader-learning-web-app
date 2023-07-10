import { Annotation, Range, StateField } from "@codemirror/state";
import {Decoration, DecorationSet, EditorView, WidgetType} from "@codemirror/view"

export const filterDecoration =
    Annotation.define<(from: number, to: number, spec: any) => boolean>();

export const addDecoration = Annotation.define<Range<Decoration>[]>();

export const decorations =
 StateField.define<DecorationSet>({
    create(state) {
        return Decoration.none;
    },

    update(decatations, transaction) {
        const filter = transaction.annotation(filterDecoration);
        if (filter) {
            decatations = decatations.update({ filter });
        }

        const add = transaction.annotation(addDecoration);
        if (add) {
            decatations = decatations.update({ add });
        }

        return decatations;
    },

    provide(field) {
        return EditorView.decorations.from(field)
    },
})