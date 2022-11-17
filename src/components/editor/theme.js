/**
 * @name dracula
 * @author dracula
 * Michael Kaminsky (http://github.com/mkaminsky11)
 * Original dracula color scheme by Zeno Rocha (https://github.com/zenorocha/dracula-theme)
 */
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView } from "codemirror";

export const createTheme = ({ theme, settings, styles }) => {
    const themeOptions = {
        "&": {
            backgroundColor: settings.background,
            color: settings.foreground,
            height: "100%",
            // borderRadius: "0.5rem",
        },
        ".cm-gutters": {
            // borderRadius: "0.5rem",
        },
        "&.cm-editor.cm-focused": {
            outline: "2px solid transparent",
            outlineOffset: "2px",
        },
    };

    if (settings.gutterBackground) {
        themeOptions[".cm-gutters"].backgroundColor = settings.gutterBackground;
    }
    if (settings.gutterForeground) {
        themeOptions[".cm-gutters"].color = settings.gutterForeground;
    }
    if (settings.gutterBorder) {
        themeOptions[".cm-gutters"].borderRightColor = settings.gutterBorder;
    }

    if (settings.caret) {
        themeOptions[".cm-content"] = {
            caretColor: settings.caret,
        };
        themeOptions[".cm-cursor, .cm-dropCursor"] = {
            borderLeftColor: settings.caret,
        };
    }
    let activeLineGutterStyle = {};
    if (settings.gutterActiveForeground) {
        activeLineGutterStyle.color = settings.gutterActiveForeground;
    }
    if (settings.lineHighlight) {
        themeOptions[".cm-activeLine"] = {
            backgroundColor: settings.lineHighlight,
        };
        activeLineGutterStyle.backgroundColor = settings.lineHighlight;
    }
    themeOptions[".cm-activeLineGutter"] = activeLineGutterStyle;

    if (settings.selection) {
        themeOptions[
            "&.cm-focused .cm-selectionBackground .cm-selectionBackground, & .cm-selectionLayer .cm-selectionBackground, ::selection"
        ] = {
            backgroundColor: settings.selection,
        };
    }
    if (settings.selectionMatch) {
        themeOptions["& .cm-selectionMatch"] = {
            backgroundColor: settings.selectionMatch,
        };
    }
    const themeExtension = EditorView.theme(themeOptions, {
        dark: theme === "dark",
    });

    const highlightStyle = HighlightStyle.define(styles);
    const extension = [themeExtension, syntaxHighlighting(highlightStyle)];

    return extension;
};

export const dracula = createTheme({
    theme: "dark",
    settings: {
        background: "#282a36",
        foreground: "#f8f8f2",
        caret: "#f8f8f0",
        selection: "rgba(255, 255, 255, 0.1)",
        selectionMatch: "rgba(255, 255, 255, 0.2)",
        gutterBackground: "#282a36",
        gutterForeground: "#6D8A88",
        lineHighlight: "rgba(255, 255, 255, 0.0)",
    },
    styles: [
        { tag: tags.comment, color: "#6272a4" },
        { tag: tags.string, color: "#f1fa8c" },
        { tag: tags.atom, color: "#bd93f9" },
        { tag: tags.meta, color: "#f8f8f2" },
        { tag: [tags.keyword, tags.operator, tags.tagName], color: "#ff79c6" },
        {
            tag: [tags.function(tags.propertyName), tags.propertyName],
            color: "#66d9ef",
        },
        {
            tag: [
                tags.definition(tags.variableName),
                tags.function(tags.variableName),
                tags.className,
                tags.attributeName,
            ],
            color: "#50fa7b",
        },

        { tag: tags.atom, color: "#bd93f9" },
    ],
});
