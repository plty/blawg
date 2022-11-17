import { useState } from "react";

import { cpp } from "@codemirror/lang-cpp";
import { StreamLanguage } from "@codemirror/language";
import { gas } from "@codemirror/legacy-modes/mode/gas";
import { RangeSetBuilder } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { Decoration } from "@codemirror/view";
import { ViewPlugin } from "@codemirror/view";
import CodeMirror from "@uiw/react-codemirror";
import axios from "axios";
import _ from "lodash";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import { useDebounce } from "rooks";
import { useLocalstorageState } from "rooks";

import { dracula } from "./editor/theme";

const queryClient = new QueryClient();

const pyCode = `\
def f(x):
    return x * x

def main():
    print(f(20))\
`;

const cppCode = `\
#include<iostream>

int f(int x) {
    return x < 2 ? x : f(x - 1) + f(x - 2);
}

int g(int x) {
    return x == 0 ? 1 : x * g(x - 1);
}

int main()
{
    // std::cout << f(8) << " " << g(5) << std::endl;
}
`;

const colorOf = (v) => `hsla(${(v * 69) % 360}, 85%, 50%, ${15}%)`;
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

const Blox = ({ doc, lang, hlgs, onChange, readonly, rolename }) => {
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

const godbolt = axios.create({
    baseURL: "https://godbolt.org/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json ",
    },
});

const Fulgurite = () => {
    const lang = "c++";
    const compiler = "clang1500";
    const [compileArgs, _setCompileArgs] = useState("-std=c++20 -O1");
    const [code, setCode] = useLocalstorageState(
        "flare:fulgurite:main",
        cppCode,
    );
    const setCodeDebounced = useDebounce(setCode, 1000);
    // const data = { asm: [] };
    const { data } = useQuery(["compile", code], async () => {
        const r = await godbolt.post(`/compiler/${compiler}/compile`, {
            source: code,
            compiler: compiler,
            options: {
                userArguments: compileArgs,
                filters: {
                    binary: false,
                    execute: true,
                    intel: false,
                    demangle: true,
                    labels: true,
                    libraryCode: false,
                    directives: true,
                    commentOnly: true,
                    trim: false,
                },
                tools: [],
                libraries: [],
            },
            lang: lang,
            files: [],
            bypassCache: false,
            allowStoreCodeDebug: true,
        });
        return r.data;
    });

    const asmsrc = (data?.asm ?? [])
        .map(({ source }, i) => [i + 1, source?.file, source?.line])
        .filter(([_, file, line]) => file === null && !!line)
        .map(([asmLine, _, srcLine]) => [asmLine, srcLine]);
    const togrp = _.fromPairs(
        _.sortedUniq(asmsrc.map(([_asmLine, srcLine]) => srcLine)).map(
            (srcLine, i) => [srcLine, i],
        ),
    );
    return (
        <div className={"grid grid-cols-1 md:grid-cols-2 place-items-stretch"}>
            <Blox
                doc={code}
                onChange={setCodeDebounced}
                hlgs={togrp}
                lang="cpp"
                rolename="cpp"
            />
            <Blox
                doc={
                    data?.asm?.map((line) => line.text).join("\n") ??
                    "compiling"
                }
                lang="asm"
                hlgs={_.fromPairs(
                    asmsrc.map(([asmLine, srcLine]) => [
                        asmLine,
                        togrp[srcLine],
                    ]),
                )}
                rolename="asm"
                readonly
            />
        </div>
    );
};

const FulguriteSis = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <Fulgurite />
            <div className="flex bg-[#282a36] my-12">
                {_.range(20).map((v) => (
                    <div
                        key={v}
                        className="w-8 h-8"
                        style={{ backgroundColor: colorOf(v) }}
                    ></div>
                ))}
            </div>
        </QueryClientProvider>
    );
};

export default FulguriteSis;
