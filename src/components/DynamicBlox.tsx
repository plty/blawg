import { useEffect, useRef } from "react";

import { Extension, Line, RangeSetBuilder } from "@codemirror/state";
import { oneDark, oneDarkTheme } from "@codemirror/theme-one-dark";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from "@codemirror/view";
import { basicSetup } from "codemirror";

import { usePromise } from "../hooks/usePromise";
import { Lang, highlighter } from "./editor/lang-support";
import { dracula } from "./editor/theme";

const visibleLines = (view: EditorView) =>
    view.visibleRanges.flatMap(({ from, to }): Line[] => {
        const lines = [];
        for (let pos = from; pos <= to;) {
            const line = view.state.doc.lineAt(pos);
            lines.push(line);
            pos = line.to + 1;
        }
        return lines;
    });

const showStripes = (lineGroup: { [line: number]: number }): Extension => {
    const decorate = (
        view: EditorView,
        lineGroup: { [line: number]: number },
    ) => {
        const colorOf = (v: number, al: number) =>
            `hsla(${(v * 37) % 360}, 50%, 50%, ${al}%)`;

        const decorationOf = (line: number): Decoration =>
            Decoration.line({
                attributes: {
                    style: `background-color: ${colorOf(line, 15)}`
                },
            });

        return visibleLines(view)
            .filter((line) => line.number in lineGroup)
            .map((line: Line): [Line, Decoration] => [
                line,
                decorationOf(lineGroup[line.number]),
            ])
            .reduce((b, [l, d]) => {
                b.add(l.from, l.from, d);
                return b;
            }, new RangeSetBuilder<Decoration>())
            .finish();
    };

    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = decorate(view, lineGroup);
            }
            update(update: ViewUpdate) {
                if (!update.docChanged && !update.viewportChanged) return;
                this.decorations = decorate(update.view, lineGroup);
            }
        },
        {
            decorations: (v) => {
                return v.decorations;
            },
        },
    );
};

type BloxProp = {
    code: string;
    lang: Lang;
    lineGroup: { [line: number]: number };
    onChange?: (_: string) => void;
    readonly?: boolean;
};

export const DynamicBlox: React.FC<BloxProp> = ({
    code,
    lang,
    lineGroup,
    onChange,
    readonly,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const editorRef = useRef<EditorView | null>(null);
    const { state, value: langExt } = usePromise(
        () => highlighter[lang](),
        [lang],
    );
    useEffect(() => {
        editorRef.current = new EditorView({
            doc: code,
            extensions: [
                basicSetup,
                showStripes(lineGroup),
                oneDark,
                ...(state === "resolve" ? [langExt] : []),
                EditorView.contentAttributes.of({
                    contenteditable: `${!readonly}`,
                }),
            ],
            parent: ref.current!,
        });
        return () => editorRef.current!.destroy();
    });
    return <div className="max-h-[400px] overflow-y-auto" ref={ref}></div>;
};

export default DynamicBlox;
