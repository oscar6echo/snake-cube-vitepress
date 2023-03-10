import { defineConfig } from "vitepress";

// const base = "/testbase/";
const base = "/snake-cube-vitepress/";
// const base= "/pages/orga/repo";

export default defineConfig({
  title: `Snake Cube`,
  description: "Exploration",
  base,
  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: `${base}favicon.ico` },
    ],
  ],

  vue: {},

  themeConfig: {
    logo: "/img/snake-cube-done.jpg",

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/oscar6echo/vitepress-snake-cube",
      },
    ],

    footer: {
      message: `MIT License.`,
      copyright: "Copyright © 2023-present oscar6echo",
    },

    // nav: [
    //   { text: "", link: "/section/", activeMatch: "/section/" },
    // ],

    sidebar: {
      "/section/": [
        {
          text: "",
          items: [
            {
              text: "Definitions",
              link: "/section/",
            },
            {
              text: "Search",
              link: "/section/search",
            },
            {
              text: "Stats",
              link: "/section/stats",
            },
            {
              text: "Viewer",
              link: "/section/viz",
            },
          ],
        },
      ],
    },
  },
});
