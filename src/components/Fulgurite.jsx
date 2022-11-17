import { createContext, useContext, useEffect, useRef } from "react";

import { cpp } from "@codemirror/lang-cpp";
import { EditorState } from "@codemirror/state";
import { RangeSetBuilder } from "@codemirror/state";
import { Facet } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { ViewPlugin } from "@codemirror/view";
import { EditorView, basicSetup } from "codemirror";
import { StreamLanguage } from "@codemirror/language"
import { gas } from "@codemirror/legacy-modes/mode/gas"

import { dracula } from "./editor/theme";

const pyCode = `\
def f(x):
    return x * x

def main():
    print(f(20))\
`;

const cppCode = `\
#include<iostream>

int f(int x) {
    int v = x * x * x;
    int w = v + v * v;
    return w;
}
int main()
{
    std::cout << f(20);
}
`;

const asmCode = `
f(int):                                  # @f(int)
        movl    %edi, %ecx
        imull   %edi, %ecx
        imull   %edi, %ecx
        movl    %ecx, %eax
        imull   %ecx, %eax
        addl    %ecx, %eax
        retq
main:                                   # @main
        pushq   %rax
        movq    std::cout@GOTPCREL(%rip), %rdi
        movl    $64008000, %esi                 # imm = 0x3D0AF40
        callq   std::basic_ostream<char, std::char_traits<char> >::operator<<(int)@PLT
        xorl    %eax, %eax
        popq    %rcx
        retq
_GLOBAL__sub_I_example.cpp:             # @_GLOBAL__sub_I_example.cpp
        pushq   %rbx
        leaq    std::__ioinit(%rip), %rbx
        movq    %rbx, %rdi
        callq   std::ios_base::Init::Init()@PLT
        movq    std::ios_base::Init::~Init()@GOTPCREL(%rip), %rdi
        leaq    __dso_handle(%rip), %rdx
        movq    %rbx, %rsi
        popq    %rbx
        jmp     __cxa_atexit@PLT                # TAILCALL
`

const stepSize = Facet.define({
    combine: (values) => (values.length ? Math.min(...values) : 2),
});
const zebraStripes = ({ step }) => {
    return [stepSize.of(5), showStripes];
};
const stripe = (line) =>
    Decoration.line({
        attributes: {
            style: `background-color: rgba(255, 255, 255, ${((23 * line) % 256) / 512})`,
        },
    });

const stripeDeco = (view) => {
    let builder = new RangeSetBuilder();
    for (let { from, to } of view.visibleRanges) {
        for (let pos = from; pos <= to;) {
            let line = view.state.doc.lineAt(pos);
            if ([1, 2, 8, 9].includes(line.number))
                builder.add(line.from, line.from, stripe(line.number));
            pos = line.to + 1;
        }
    }
    return builder.finish();
};

const showStripes = ViewPlugin.fromClass(
    class {
        constructor(view) {
            this.decorations = stripeDeco(view);
        }

        update(update) {
            if (update.docChanged || update.viewportChanged)
                this.decorations = stripeDeco(update.view);
        }
    },
    {
        decorations: (v) => {
            return v.decorations;
        },
    },
);

const EditorStateContext = createContext(null);

const Fulgurite = () => {
    const state = useContext(EditorStateContext);
    const ref = useRef(null);

    useEffect(() => {
        console.log("once?");
        const editor = new EditorView({
            state: state,
            parent: ref.current,
        });
        return () => {
            editor.destroy();
        };
    });
    return <div className="h-full" ref={ref}></div>;
};

const FulguriteBro = () => {
    const codeRef = useRef(null);
    const asmRef = useRef(null);
    if (!codeRef.current) {
        codeRef.current = EditorState.create({
            doc: cppCode,
            extensions: [
                basicSetup,
                dracula,
                zebraStripes({ step: 2 }),
                cpp(),
            ],
        });
    }
    if (!asmRef.current) {
        asmRef.current = EditorState.create({
            doc: asmCode,
            extensions: [
                basicSetup,
                dracula,
                zebraStripes({ step: 2 }),
                StreamLanguage.define(gas),
            ],
        });
    }

    return (
        <div className="grid grid-cols-2 place-items-stretch">
            < EditorStateContext.Provider value={codeRef.current} >
                <div className="bg-blue-500">
                    <Fulgurite />
                </div>
            </EditorStateContext.Provider >
            <EditorStateContext.Provider value={asmRef.current}>
                <Fulgurite />
            </EditorStateContext.Provider>
        </div >
    );
};

export default FulguriteBro;
