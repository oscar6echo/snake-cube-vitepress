import { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";

import { createPinia } from "pinia";

import Playground from "../components/Playground.vue";
import ShowImage from "../components/ShowImage.vue";
import StatsTable from "../components/StatsTable.vue";

// import "uno.css";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("Playground", Playground);
    ctx.app.component("ShowImage", ShowImage);
    ctx.app.component("StatsTable", StatsTable);

    const pinia = createPinia();
    ctx.app.use(pinia);
  },
};
