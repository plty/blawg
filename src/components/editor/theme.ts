import {
    HighlightStyle,
    TagStyle,
    syntaxHighlighting,
} from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { EditorView } from "codemirror";

type CreateThemeOptions = {
    theme: Theme;
    settings: Settings;
    styles: TagStyle[];
};
type Theme = "light" | "dark";
type Settings = {
    background: string;
    foreground: string;
    caret: string;
    selection: string;
    selectionMatch: string;
    lineHighlight: string;
    gutterBackground: string;
    gutterForeground: string;
    fontFamily?: string;
};

export const createTheme = ({
    theme,
    settings,
    styles,
}: CreateThemeOptions): Extension => {
    const themeOptions: { [key: string]: { [key: string]: string } } = {
        "&": {
            backgroundColor: settings.background,
            color: settings.foreground,
        },
        ".cm-gutters": {
            backgroundColor: settings.gutterBackground,
            foregroundColor: settings.gutterForeground,
        },
        "&.cm-editor.cm-focused": {
            outline: "2px solid transparent",
            outlineOffset: "2px",
        },
        "&.cm-editor .cm-scroller": {
            fontFamily: settings.fontFamily || "monospace",
        },
        ".cm-activeLine": {
            backgroundColor: settings.lineHighlight,
        },
        ".cm-activeLineGutter": {
            backgroundColor: settings.lineHighlight,
        },
        ".cm-content": {
            caretColor: settings.caret,
        },
        ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: settings.caret,
        },
        "&.cm-focused .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, .cm-content ::selection":
            {
                backgroundColor: settings.selection,
            },
        "& .cm-selectionMatch": {
            backgroundColor: settings.selectionMatch,
        },
    };

    return [
        EditorView.theme(themeOptions, {
            dark: theme === "dark",
        }),
        syntaxHighlighting(HighlightStyle.define(styles)),
    ];
};

export const dracula = createTheme({
    theme: "dark",
    settings: {
        background: "#282A36",
        foreground: "#F8F8F2",
        caret: "#F8F8F0",
        selection: "rgba(255, 255, 255, 0.1)",
        selectionMatch: "rgba(255, 255, 255, 0.2)",
        gutterBackground: "#282A36",
        gutterForeground: "#6D8A88",
        lineHighlight: "rgba(255, 255, 255, 0.0)",
    },
    styles: [
        { tag: tags.comment, color: "#6272A4" },
        { tag: tags.string, color: "#F1FA8C" },
        { tag: tags.atom, color: "#BD93F9" },
        { tag: tags.meta, color: "#F8F8F2" },
        { tag: [tags.keyword, tags.operator, tags.tagName], color: "#FF79C6" },
        {
            tag: [tags.function(tags.propertyName), tags.propertyName],
            color: "#66D9EF",
        },
        {
            tag: [
                tags.definition(tags.variableName),
                tags.function(tags.variableName),
                tags.className,
                tags.attributeName,
            ],
            color: "#50FA7B",
        },
        { tag: tags.atom, color: "#BD93F9" },
    ],
});
