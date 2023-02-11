import { defineConfig } from "vitepress";

export default defineConfig({
  title: `Snake Cube`,
  description: "Exploration",

  head: [
    [
      "link",
      { rel: "icon", type: "image/svg+xml", href: "/snake-cube-done.jpg" },
    ],
    ["meta", { name: "theme-color", content: "#646cff" }],
  ],

  vue: {},

  themeConfig: {
    logo: "/snake-cube-done.jpg",

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

    nav: [
      { text: "Definition", link: "/definition/", activeMatch: "/definition/" },
      { text: "Search", link: "/search/", activeMatch: "/search/" },
      { text: "Results", link: "/results/", activeMatch: "/results/" },
    ],

    sidebar: {
      "/definition/": [
        {
          text: "Definition",
          items: [
            {
              text: "Snake Cube",
              link: "/definition/",
            },
            {
              text: "Examples",
              link: "/definition/examples",
            },
          ],
        },
      ],
      "/search/": [
        {
          text: "Search",
          items: [
            {
              text: "Algorithm",
              link: "/search/",
            },
            {
              text: "Code",
              link: "/search/code",
            },
          ],
        },
      ],
      "/results/": [
        {
          text: "Results",
          items: [
            {
              text: "Stats",
              link: "/results/",
            },
            {
              text: "Viewer",
              link: "/results/viewer",
            },
          ],
        },
      ],
    },
  },
});
