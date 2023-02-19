import { EnhanceAppContext } from "vitepress";
import DefaultTheme from "vitepress/theme";

import { createPinia } from "pinia";

import ShowImage from "../components/ShowImage.vue";

// import "uno.css";
import "./custom.css";

export default {
  ...DefaultTheme,
  enhanceApp(ctx: EnhanceAppContext) {
    DefaultTheme.enhanceApp(ctx);
    ctx.app.component("ShowImage", ShowImage);

    const pinia = createPinia();
    ctx.app.use(pinia);
  },
};
