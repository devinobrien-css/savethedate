import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // ──────────────────────────────────────────────────────────────
        //  POWDER BLUE — soft · romantic · refined
        //  Shared palette across all three designs:
        //  powder blue · ivory · gold · white · greenery, over deep navy.
        //  Token names are kept per-version so existing classNames still
        //  resolve; all three now map to this one palette.
        // ──────────────────────────────────────────────────────────────
        // Version 1
        v1: {
          ink: "#1e2a3a", // deep navy
          navy: "#2d4258", // navy
          denim: "#5e7896", // powder-blue accent
          sky: "#8aa6c4", // light blue (on dark)
          mist: "#c2d2e1", // powder blue, soft
          blush: "#c8a23a", // gilded gold (script accents)
          butter: "#e4c66b", // light gilded gold
          paper: "#f3ecdc", // ivory
        },
        // Version 2
        v2: {
          espresso: "#1e2a3a", // deep navy
          walnut: "#2d4258", // navy (headings)
          caramel: "#5e7896", // powder-blue accent
          terracotta: "#c8a23a", // gilded gold
          taupe: "#b9c6d3", // soft powder-gray (borders)
          cream: "#efe7d6", // ivory
          sand: "#e7dcc6", // sand / soft ivory
          linen: "#fbf7ee", // lightest ivory
        },
        // Version 3
        v3: {
          ink: "#1e2a3a", // deep navy
          delft: "#5e7896", // powder-blue accent
          periwinkle: "#c8a23a", // gilded gold (floral accents)
          powder: "#c2d2e1", // powder blue, soft
          haze: "#dde6ef", // powder blue, lightest
          sage: "#7c8d60", // greenery
          white: "#fcfdff", // white
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "serif"],
        display: ["var(--font-playfair)", "Playfair Display", "serif"],
        sans: ["var(--font-jost)", "Jost", "system-ui", "sans-serif"],
        script: ["var(--font-tangerine)", "cursive"],
      },
      letterSpacing: {
        widest2: "0.35em",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "ken-burns": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.12)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 1s ease-out forwards",
        "fade-in": "fade-in 1.4s ease-out forwards",
        "ken-burns": "ken-burns 18s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
