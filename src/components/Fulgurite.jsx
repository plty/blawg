import { useState } from "react";

import axios from "axios";
import _ from "lodash";
import { useQuery } from "react-query";
import { useDebounce } from "rooks";
import { useLocalstorageState } from "rooks";

import Blox from "./Blox";
import TopLevelProvider from "./TopLevelProvider";

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
    const [code, setCode] = useState(cppCode);
    const setCodeDebounced = useDebounce(setCode, 1000);
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
        <div
            className={
                "grid grid-cols-1 space-y-2 md:grid-cols-2 md:space-y-0 place-items-stretch"
            }
        >
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

export default Fulgurite;

export const FulguriteIsland = () => (
    <TopLevelProvider>
        <Fulgurite />
    </TopLevelProvider>
);
