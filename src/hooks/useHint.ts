import { createContext } from "react";

export type CompileHint = {
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

const HintContext = createContext<{ [id: string]: unknown }>({});

const CompileHintContext = createContext<{ [id: string]: CompileHint }>({});
