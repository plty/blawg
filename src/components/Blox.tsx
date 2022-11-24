import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from "@codemirror/view";

import { usePromise } from "../hooks/usePromise";
import { StaticBlox, genCSSRules } from "./StaticBlox";

export type HLGS = { [line: number]: number };
type Lang = "rust" | "cpp" | "asm";
type BloxProp = {
    code: string;
    lang: Lang;
    hlgs: HLGS;
    onChange?: (_: string) => void;
    readonly?: boolean;
};

const Blox: React.FC<BloxProp> = ({ code, lang, hlgs, onChange, readonly }) => {
    const { state, value: DynamicBlox } = usePromise(
        async () => (await import("./DynamicBlox")).DynamicBlox,
        [],
    );

    return (
        <>
            {state === "resolve" && (
                <DynamicBlox
                    code={code}
                    lang={lang}
                    hlgs={hlgs}
                    onChange={onChange}
                    readonly={readonly}
                />
            )}
            {state !== "resolve" && (
                <StaticBlox
                    code={code}
                    lang={lang}
                    lineGroup={hlgs}
                    highlightStyle={oneDarkHighlightStyle}
                />
            )}
        </>
    );
};

export default Blox;
