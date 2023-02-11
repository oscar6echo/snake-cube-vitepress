import presetAttributify from "@unocss/preset-attributify";
import UnocssIcons from "@unocss/preset-icons";
import presetUno from "@unocss/preset-uno";
import UnoCSS from "@unocss/vite";

export default {
  plugins: [
    UnoCSS({
      mode: "vue-scoped",
      presets: [
        presetUno(),
        presetAttributify({ prefix: "un-", prefixedOnly: true }),
        UnocssIcons({
          // options
          prefix: "i-",
          extraProperties: {
            display: "inline-block",
          },
        }),
      ],
    }),
  ],
};
