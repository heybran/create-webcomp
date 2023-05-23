import { defineConfig } from "npm:vite";
import html from "npm:rollup-plugin-html";

export default defineConfig({
  plugins: [
    html({
      include: "src/components/**/*.html",
      htmlMinifierOptions: {
        collapseWhitespace: true,
        removeComments: true,
        minifyCSS: true,
        minifyJS: true,
      },
    }),
  ],
});
