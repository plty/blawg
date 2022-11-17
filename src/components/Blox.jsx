import { cpp } from "@codemirror/lang-cpp";
import { StreamLanguage } from "@codemirror/language";
import { gas } from "@codemirror/legacy-modes/mode/gas";
import { RangeSetBuilder } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Decoration } from "@codemirror/view";
import { ViewPlugin } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";

import { dracula } from "./editor/theme";

const colorOf = (v) => `hsla(${(v * 37) % 360}, 85%, 50%, ${15}%)`;
const stripe = (line) =>
    Decoration.line({
        attributes: {
            style: `background-color: ${colorOf(line)}`,
        },
    });

const visibleLines = (view) =>
    view.visibleRanges.flatMap(({ from, to }) => {
        const lines = [];
        for (let pos = from; pos <= to; ) {
            const line = view.state.doc.lineAt(pos);
            lines.push(line);
            pos = line.to + 1;
        }
        return lines;
    });

const stripeDeco = (view, hlgs) => {
    const builder = new RangeSetBuilder();
    visibleLines(view)
        .filter((line) => line.number in hlgs)
        .map((line) => [line, stripe(hlgs[line.number])])
        .forEach(([line, decoration]) =>
            builder.add(line.from, line.from, decoration),
        );
    return builder.finish();
};

const showStripes = (hlgs) =>
    ViewPlugin.fromClass(
        class {
            constructor(view) {
                this.decorations = stripeDeco(view, hlgs);
            }
            update(update) {
                if (!update.docChanged && !update.viewportChanged) return;
                this.decorations = stripeDeco(update.view, hlgs);
            }
        },
        {
            decorations: (v) => {
                return v.decorations;
            },
        },
    );

const Blox = ({ doc, lang, hlgs, onChange, readonly }) => {
    return (
        <CodeMirror
            value={doc}
            onChange={onChange}
            theme={dracula}
            height={"400px"}
            extensions={[
                showStripes(hlgs ?? {}),
                lang == "cpp" ? cpp() : StreamLanguage.define(gas),
                EditorView.contentAttributes.of({ contenteditable: !readonly }),
            ]}
        />
    );
};

export default Blox;
