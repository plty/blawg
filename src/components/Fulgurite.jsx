import { dracula } from "@codesandbox/sandpack-themes";
import {
    Sandpack,
    SandpackProvider,
    SandpackCodeEditor,
} from "@codesandbox/sandpack-react";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";

const pyCode = `\
def f(x):
    return x * x

def main():
    print(f(20))
`;
const cppCode = `\
#include<iostream>

int f(int x) {
    return x * x;
}

int main() {
    std::cout << f(20);
}
`;

const Fulgurite = () => {
    return (
        <>
            <SandpackProvider>
                <SandpackCodeEditor
                    additionalLanguages={[
                        {
                            name: "python",
                            extensions: ["py"],
                            language: python(),
                        },
                    ]}
                />
            </SandpackProvider>
            <Sandpack
                template="vanilla"
                theme={dracula}
                files={{
                    "/main.py": pyCode,
                    "/main.cpp": cppCode,
                }}
                options={{
                    visibleFiles: ["/main.py", "/main.cpp"],
                    activeFile: "/main.cpp",
                    showTabs: true,
                    codeEditor: {
                        additionalLanguages: [
                            {
                                name: "cpp",
                                extensions: ["cc", "cpp"],
                                language: cpp(),
                            },

                            {
                                name: "python",
                                extensions: ["py"],
                                language: python(),
                            },
                        ],
                    },
                }}
            />
        </>
    );
};

export default Fulgurite;
