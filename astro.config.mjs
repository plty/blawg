import { defineConfig } from "astro/config";
import alpinejs from "@astrojs/alpinejs";
import image from "@astrojs/image";
import partytown from "@astrojs/partytown";
import prefetch from "@astrojs/prefetch";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
    site: 'https://bigpp.dev',
    integrations: [
        alpinejs(),
        image(),
        partytown(),
        prefetch(),
        sitemap({}),
        tailwind(),
    ],
    markdown: {
        shikiConfig: {
            theme: "dracula",
            langs: [],
            wrap: true,
        },
    },
});
