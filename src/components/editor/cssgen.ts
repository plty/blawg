import type { HighlightStyle } from "@codemirror/language";
import type { Extension } from "@codemirror/state";

export const cssgen = (
    highlightStyle: HighlightStyle,
    theme: Extension,
) => {
    type Theme = [{ value: string }, ...{ value?: { getRules?(): string } }[]];

    const [_head, ...rest] = theme as unknown as Theme;
    return [
        ...rest
            .filter((v) => v.value?.getRules?.())
            .map((v) => v.value!.getRules!()),
        highlightStyle.module!.getRules(),
    ].join("\n");
};
