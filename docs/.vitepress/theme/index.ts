import { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";

import Playground from "../components/Playground.vue";
// import Playground from "../components/Playground.vue";

// import "uno.css";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("Playground", Playground);
  },
};
