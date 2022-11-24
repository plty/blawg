import React, { useMemo, useState } from "react";

import { HighlightStyle, Language, StreamLanguage } from "@codemirror/language";
import { Extension, Line, RangeSetBuilder, Text } from "@codemirror/state";
import { Decoration, lineNumbers } from "@codemirror/view";
import { highlightTree } from "@lezer/highlight";
import _range from "lodash/range";
import _zip from "lodash/zip";

import { usePromise } from "../hooks/usePromise";
import type { HLGS } from "./Blox";
import type { Lang } from "./DynamicBlox";

const decorations = (
    lang: Language,
    highlightStyle: HighlightStyle,
    code: string,
) => {
    const tree = lang.parser.parse(code);
    const builder = new RangeSetBuilder<Decoration>();
    highlightTree(tree, highlightStyle, (from, to, style) => {
        builder.add(from, to, Decoration.mark({ class: style }));
    });
    return builder.finish();
};

const zip = function <T1, T2>(a: T1[], b: T2[]): [T1, T2][] {
    const len = Math.min(a.length, b.length);
    return _zip(a.slice(0, len), b.slice(0, len)) as [T1, T2][];
};

const parser = {
    rust: async () =>
        (await import("@codemirror/lang-rust")).rustLanguage as Language,
    cpp: async () =>
        (await import("@codemirror/lang-cpp")).cppLanguage as Language,
    asm: async () =>
        StreamLanguage.define(
            (await import("@codemirror/legacy-modes/mode/gas")).gas,
        ),
};

type StaticBloxProp = {
    code: string;
    lang: Lang;
    highlightStyle: HighlightStyle;
    lineGroup: HLGS;
};
export const StaticBlox = ({
    code,
    lang,
    highlightStyle,
    lineGroup: lg,
}: StaticBloxProp) => {
    type Decoz = { tag: string; cls: string; range: { s: number; e: number } };
    const [hlGroup, setHlGroup] = useState(-1);

    const { state, value: langParser } = usePromise(
        () => parser[lang](),
        [lang],
    );

    const decors =
        state === "resolve"
            ? decorations(langParser, highlightStyle, code)
            : new RangeSetBuilder<Decoration>().finish();
    const lines = Text.of(code.split("\n"));
    const marks = function* (line: Line): Generator<Decoz> {
        type DecorValue = {
            tagName: string;
            class: string;
        };

        for (
            let curs = decors.iter(line.from);
            curs.value && curs.from < line.to;
            curs.next()
        ) {
            const decoration = curs.value as unknown as DecorValue;
            yield {
                tag: decoration.tagName,
                cls: decoration.class,
                range: {
                    s: Math.max(curs.from, line.from),
                    e: Math.min(curs.to, line.to),
                },
            };
        }
    };

    const colorOf = (v: number, al: number) =>
        `hsla(${(v * 37) % 360}, 85%, 50%, ${al}%)`;

    const CodeLine = ({ line }: { line: Line }) => {
        const ms = [...marks(line)];
        if (ms.length == 0) {
            return (
                <div
                    className="cm-line transition duration-500"
                    style={
                        line.number in lg
                            ? {
                                  backgroundColor: colorOf(
                                      lg[line.number],
                                      lg[line.number] === hlGroup ? 35 : 15,
                                  ),
                              }
                            : {}
                    }
                    onMouseEnter={() => setHlGroup(lg[line.number])}
                    onMouseLeave={() => setHlGroup(-1)}
                >
                    {/* TODO: use tag */}
                    <span>{lines.sliceString(line.from, line.to)}</span>
                    <br />
                </div>
            );
        }

        const [f, l] = [ms[0], ms[ms.length - 1]];
        return (
            <div
                className="cm-line transition duration-500"
                style={
                    line.number in lg
                        ? {
                              backgroundColor: colorOf(
                                  lg[line.number],
                                  lg[line.number] === hlGroup ? 35 : 15,
                              ),
                          }
                        : {}
                }
                onMouseEnter={() => setHlGroup(lg[line.number])}
                onMouseLeave={() => setHlGroup(-1)}
            >
                <span key={"start"}>
                    {lines.sliceString(line.from, f.range.s)}
                </span>
                <span className={ms[0].cls}>
                    {lines.sliceString(f.range.s, f.range.e)}
                </span>
                {zip(ms, ms.slice(1)).map(([prev, next], i) => {
                    const {
                        range: { s: _ps, e: pe },
                    } = prev;
                    const {
                        range: { s: ns, e: ne },
                    } = next;
                    return (
                        <React.Fragment key={i}>
                            <span>{lines.sliceString(pe, ns)}</span>
                            <span className={next.cls}>
                                {lines.sliceString(ns, ne)}
                            </span>
                        </React.Fragment>
                    );
                })}
                <span>{lines.sliceString(l.range.e, line.to)}</span>
                <br />
            </div>
        );
    };

    const linez = useMemo(() => {
        console.log("??");
        return _range(lines.lines).map((i) => lines.line(i + 1));
    }, [code]);
    return (
        <div className="blox">
            <div className={"cm-editor gutter ͼo"}>
                <div className="cm-scroller">
                    <div className="cm-gutters">
                        <div className="cm-gutter cm-lineNumbers">
                            {_range(lines.lines).map((i) => (
                                // HACK: investigate root issue of 4px magic
                                <div
                                    key={i}
                                    className="cm-gutterElement"
                                    style={i == 0 ? { marginTop: "4px" } : {}}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div key={"content"} className="cm-content">
                        {linez.map((line) => (
                            <CodeLine key={line.number} line={line}></CodeLine>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

type Theme = [{ value: string }, ...{ value?: { getRules?(): string } }[]];

export const genCSSRules = (
    highlightStyle: HighlightStyle,
    theme: Extension,
) => {
    const [head, ...rest] = theme as unknown as Theme;
    return {
        scopeClass: head.value || "",
        highlightRules: [
            ...rest
                .filter((v) => v.value?.getRules?.())
                .map((v) => v.value!.getRules!()),
            highlightStyle.module!.getRules(),
        ],
    };
};
