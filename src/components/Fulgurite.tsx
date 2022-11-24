import { createContext, useState } from "react";

import {
    oneDarkHighlightStyle,
    oneDarkTheme,
} from "@codemirror/theme-one-dark";
import axios from "axios";
import DOMPurify from "dompurify";
import _ from "lodash";
import _fromPairs from "lodash/fromPairs";
import _toPairs from "lodash/toPairs";

import { usePromise } from "../hooks/usePromise";
import Blox from "./Blox";
import { StaticBlox, genCSSRules } from "./StaticBlox";
import TopLevelProvider from "./TopLevelProvider";
import { baseTheme } from "./editor/baseEditorStyles";

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
    std::cout << f(8) << " " << g(5) << std::endl;
}
`;

const notCppCode = `\
def f(x):
    return x * x + x

def main():
    print(f(20))
`;

const godbolt = axios.create({
    baseURL: "https://godbolt.org/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json ",
    },
});

const ansiToHtml = (ansi: string): string => {
    /* const au = new AnsiUp(); */
    /* au.ansi_to_html(ansi) */
    return DOMPurify.sanitize(ansi);
};

type CompileOpts = {
    opts: string;
    asmSyntax: "intel" | "at&t";
};

type CompileOutput = {
    code: number;
    stdout: {
        text: string;
    }[];
    stderr: {
        text: string;
    }[];
    asm: {
        text: string;
        source: { file: string | null; line: number } | null;
    }[];
};

type Compiler = ["c++", "clang1500"] | ["c++", "g122"] | ["rust", "r1650"];

const compile = async (
    [_lang, compiler]: Compiler,
    code: string,
    opts?: CompileOpts,
): Promise<CompileOutput> => {
    const r = await godbolt.post(`/compiler/${compiler}/compile`, {
        source: code,
        compiler: compiler,
        bypassCache: false,
        allowStoreCodeDebug: false,
        options: {
            userArguments: opts?.opts,
            filters: {
                binary: false,
                execute: true,
                intel: opts?.asmSyntax === "intel",
                demangle: true,
                labels: true,
                libraryCode: false,
                directives: true,
                commentOnly: true,
                trim: false,
            },
        },
    });
    return r.data;
};

type FileState = {
    filename: string;
    content: string;
};

const FileManagerContext = createContext<
    [
        { [filename: string]: FileState },
        (_filename: string, _content: string) => void,
    ]
>([{}, () => {}]);
const FileManagedFulgurite: React.FC<{
    files: FileState[];
}> = ({ files }) => {
    const [activeFile, setActiveFile] = useState("main.cpp");
    const [filemap, setFilemap] = useState(
        _.fromPairs(files.map((f) => [f.filename, f])),
    );
    return (
        <div className="drac-bg-gray rounded-lg">
            <div className="flex">
                {_.toPairs(filemap).map(([f, _]) => (
                    <button
                        key={f}
                        className={`px-4 py-2 border-b-2 text-sm ${
                            f !== activeFile && "border-transparent"
                        }`}
                        onClick={() => setActiveFile(f)}
                    >
                        {f}
                    </button>
                ))}
            </div>
            <FileManagerContext.Provider
                value={[
                    filemap,
                    (filename: string, content: string) =>
                        setFilemap({
                            ...filemap,
                            [filename]: { ...filemap[activeFile], content },
                        }),
                ]}
            >
                <Fulgurite
                    key={activeFile}
                    code={filemap[activeFile]!.content}
                    setCode={(content: string) =>
                        setFilemap({
                            ...filemap,
                            [activeFile]: { ...filemap[activeFile], content },
                        })
                    }
                />
            </FileManagerContext.Provider>
            <div className="flex justify-end py-1">
                {/*

                <input
                    className="px-4 drac-bg-black-secondary"
                    value={"--std c++20 -O1"}
                />
                <input
                    className="px-4 drac-bg-black-secondary"
                    value={"c++ clang1500"}
                />
             */}
            </div>
        </div>
    );
};

const Fulgurite = ({
    code,
    setCode,
}: {
    code: string;
    setCode: (_: string) => void;
}) => {
    const { value: data } = usePromise(
        () =>
            compile(["c++", "clang1500"], code, {
                opts: "-std=c++20 -O1",
                asmSyntax: "at&t",
            }),
        [code],
    );

    type ASMMeta = { file: string | null; line: number } | null;
    const asmsrc = (data?.asm ?? [])
        .map(({ source }, i): [ASMMeta, number] => [source, i + 1])
        .filter(([source, _]) => source && source?.file == null)
        .map(([source, i]) => [i, source!.line]);
    const togrp = _.fromPairs(
        _.uniq(asmsrc.map(([_, srcLine]) => srcLine)).map((srcLine, i) => [
            srcLine,
            i,
        ]),
    );

    const { highlightRules } = genCSSRules(oneDarkHighlightStyle, oneDarkTheme);

    /*  */
    return (
        <div
            className={
                "grid grid-cols-1 space-y-2 md:grid-cols-2 md:space-y-0 place-items-stretch"
            }
        >
            <style
                dangerouslySetInnerHTML={{ __html: baseTheme.getRules() }}
            ></style>

            {/* <style
                dangerouslySetInnerHTML={{
                    __html: highlightRules.join("\n"),
                }}
            ></style> */}
            <Blox
                lang="cpp"
                code={code}
                onChange={_.debounce(setCode, 1000)}
                hlgs={togrp}
            />
            <StaticBlox
                lang="asm"
                code={
                    data?.asm?.map((line) => line.text).join("\n") ??
                    "<Compiling>"
                }
                highlightStyle={oneDarkHighlightStyle}
                lineGroup={_.fromPairs(
                    asmsrc.map(([asmLine, srcLine]) => [
                        asmLine,
                        togrp[srcLine],
                    ]),
                )}
            />
        </div>
    );
};

export default Fulgurite;

export const FulguriteIsland = () => (
    <TopLevelProvider>
        <FileManagedFulgurite
            files={[
                { filename: "main.cpp", content: cppCode },
                { filename: "notmain.py", content: notCppCode },
            ]}
        />
    </TopLevelProvider>
);
