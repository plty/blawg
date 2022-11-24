import alpinejs from "@astrojs/alpinejs";
import image from "@astrojs/image";
import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
    site: "https://bigpp.dev",
    integrations: [
        tailwind(),
        alpinejs(),
        image(),
        prefetch(),
        sitemap({}),
        react(),
        mdx(),
    ],
    markdown: {
        shikiConfig: {
            theme: "dracula",
            langs: [],
            wrap: true,
        },
    },
});
