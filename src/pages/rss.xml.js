import rss from "@astrojs/rss";

const posts = Object.values(import.meta.glob("./**/*.md", { eager: true }));
export const get = () =>
    rss({
        title: "Big Peepee Developer",
        description: "bigpp.dev",
        site: import.meta.env.SITE,
        items: [...posts].map((post) => ({
            link: post.url,
            title: post.frontmatter.title,
            pubDate: post.frontmatter.pub_date,
        })),
        stylesheet: "/rss/styles.xsl",
        customData: `<language>en-us</language>`,
    });
