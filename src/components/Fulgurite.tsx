import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import _ from "lodash";
import _fromPairs from "lodash/fromPairs";
import _toPairs from "lodash/toPairs";

import { usePromise } from "../hooks/usePromise";
import { cppCode } from "../utils/constants";
import { CompileOutput, compile } from "../utils/godbolt";
import Blox from "./Blox";
import { StaticBlox } from "./StaticBlox";
import TopLevelProvider from "./TopLevelProvider";

const Fulgurite = ({
    code,
    setCode,
    hint,
}: {
    code: string;
    setCode: (_: string) => void;
    hint: { [code: string]: CompileOutput };
}) => {
    const { value: realData } = usePromise(
        () =>
            compile(["c++", "clang1500"], code, {
                opts: "-std=c++20 -O1",
                asmSyntax: "at&t",
            }),
        [code],
    );

    const data = realData || hint[code];
    type ASMMeta = { file: string | null; line: number } | null;
    const asmsrc = (data?.asm ?? [])
        .map(({ source }, i): [ASMMeta, number] => [source, i + 1])
        .filter(([source, _]) => source && source?.file == null)
        .map(([source, i]) => [i, source!.line]);
    const lineGroup = _.fromPairs(
        _.uniq(asmsrc.map(([_, srcLine]) => srcLine)).map((srcLine, i) => [
            srcLine,
            i,
        ]),
    );

    return (
        <div
            className={
                "grid grid-cols-1 space-y-2 lg:grid-cols-2 md:space-y-0 place-items-stretch text-sm"
            }
        >
            <Blox lang="cpp" code={code} lineGroup={lineGroup} />
            <StaticBlox
                lang="asm"
                highlightStyle={oneDarkHighlightStyle}
                code={
                    data?.asm?.map((line) => line.text).join("\n") ??
                    "<Compiling>"
                }
                lineGroup={_.fromPairs(
                    asmsrc.map(([asmLine, srcLine]) => [
                        asmLine,
                        lineGroup[srcLine],
                    ]),
                )}
            />
        </div>
    );
};


export const FulguriteIsland = ({
    hint,
}: {
    hint: { [code: string]: CompileOutput };
}) => (
    <TopLevelProvider>
        <Fulgurite hint={hint} code={cppCode} setCode={() => {}} />
        {/* <FileManagedFulgurite
            files={[
                { filename: "main.cpp", content: cppCode },
                { filename: "notmain.py", content: notCppCode },
            ]}
        /> */}
    </TopLevelProvider>
);

export default FulguriteIsland;
