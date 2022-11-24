const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            fontFamily: {
                // sans: ["Literata", ...defaultTheme.fontFamily.sans],
                mono: ["Jetbrains Mono", ...defaultTheme.fontFamily.mono],
            },
        },
    },
    plugins: [
        require("@tailwindcss/typography"),
        require("@tailwindcss/forms"),
        require("@tailwindcss/line-clamp"),
        require("@tailwindcss/aspect-ratio"),
        ({ addUtilities }) => {
            addUtilities({
                ".hyphens-none": {
                    hyphens: "none",
                },
                ".hyphens-auto": {
                    hyphens: "auto",
                },
                ".hyphens-manual": {
                    hyphens: "manual",
                },
            });
        },
    ],
};
