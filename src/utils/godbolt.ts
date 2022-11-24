import axios from "axios";

export const godbolt = axios.create({
    baseURL: "https://godbolt.org/api",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json ",
    },
});

export type CompileOpts = {
    opts: string;
    asmSyntax: "intel" | "at&t";
};

export type CompileOutput = {
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

export type Compiler =
    | ["c++", "clang1500"]
    | ["c++", "g122"]
    | ["rust", "r1650"];

export const compile = async (
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
