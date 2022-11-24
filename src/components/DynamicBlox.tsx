import { useEffect, useRef } from "react";

import { StreamLanguage } from "@codemirror/language";
import { Extension, Line, RangeSetBuilder } from "@codemirror/state";
import { oneDark } from "@codemirror/theme-one-dark";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from "@codemirror/view";
import { basicSetup } from "codemirror";

import { usePromise } from "../hooks/usePromise";
import type { HLGS } from "./Blox";

const visibleLines = (view: EditorView) =>
    view.visibleRanges.flatMap(({ from, to }): Line[] => {
        const lines = [];
        for (let pos = from; pos <= to; ) {
            const line = view.state.doc.lineAt(pos);
            lines.push(line);
            pos = line.to + 1;
        }
        return lines;
    });

const showStripes = (hlgs: HLGS): Extension => {
    const decorate = (view: EditorView, hlgs: HLGS) => {
        const colorOf = (v: number, al: number) =>
            `hsla(${(v * 37) % 360}, 85%, 50%, ${al}%)`;

        const decorationOf = (line: number): Decoration =>
            Decoration.line({
                attributes: {
                    style: `background-color: ${colorOf(line, 15)}`,
                    onmouseover: `this.style.backgroundColor="${colorOf(
                        line,
                        50,
                    )}"`,
                    onmouseout: `this.style.backgroundColor="${colorOf(
                        line,
                        15,
                    )}"`,
                },
            });

        return visibleLines(view)
            .filter((line) => line.number in hlgs)
            .map((line: Line): [Line, Decoration] => [
                line,
                decorationOf(hlgs[line.number]),
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
                this.decorations = decorate(view, hlgs);
            }
            update(update: ViewUpdate) {
                if (!update.docChanged && !update.viewportChanged) return;
                this.decorations = decorate(update.view, hlgs);
            }
        },
        {
            decorations: (v) => {
                return v.decorations;
            },
        },
    );
};

//            value={doc}
//            onChange={onChange}
//            theme={dracula}
//            height={"400px"}
//            extensions={[
//                showStripes(hlgs),
//                lang == "cpp" ? cpp() : StreamLanguage.define(gas),
//                EditorView.contentAttributes.of({
//                    contenteditable: `${!readonly}`,
//                }),
//            ]}

export type Lang = "rust" | "cpp" | "asm";

const highlighter = {
    rust: async () =>
        (await import("@codemirror/lang-rust")).rust() as Extension,
    cpp: async () => (await import("@codemirror/lang-cpp")).cpp() as Extension,
    asm: async () =>
        StreamLanguage.define(
            (await import("@codemirror/legacy-modes/mode/gas")).gas,
        ) as Extension,
};

type BloxProp = {
    code: string;
    lang: Lang;
    hlgs: HLGS;
    onChange?: (_: string) => void;
    readonly?: boolean;
};

export const DynamicBlox: React.FC<BloxProp> = ({
    code,
    lang,
    hlgs,
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
                showStripes(hlgs),
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
    return <div className="h-[400px] overflow-y-auto" ref={ref}></div>;
};

export default DynamicBlox;
