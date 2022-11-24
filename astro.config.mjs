import alpinejs from "@astrojs/alpinejs";
import image from "@astrojs/image";
import mdx from "@astrojs/mdx";
import prefetch from "@astrojs/prefetch";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
    site: "https://yoten.dev",
    integrations: [tailwind(), alpinejs(), image(), prefetch(), react(), mdx()],
    markdown: {
        shikiConfig: {
            theme: "dracula",
            langs: [],
            wrap: true,
        },
    },
    output: "server",
    adapter: vercel(),
});
