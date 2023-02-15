import { defineConfig } from "vitepress";

export default defineConfig({
  title: `Snake Cube`,
  description: "Exploration",

  head: [
    ["link", { rel: "icon", type: "image/svg+xml", href: "/favicon.ico" }],
    ["meta", { name: "theme-color", content: "#646cff" }],
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
