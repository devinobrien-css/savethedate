import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Version 1 — Modern New York (scheme1: dusty/denim blues, blush, butter)
        v1: {
          ink: "#1c2433",
          navy: "#3a557e",
          denim: "#4a6896",
          sky: "#8fa9c9",
          mist: "#b8c8dc",
          blush: "#e8c4ab",
          butter: "#f6e7c3",
          paper: "#f4f6f9",
        },
        // Version 2 — Connecticut backyard (scheme2: warm earth tones)
        v2: {
          espresso: "#3d2b22",
          walnut: "#6f4a32",
          caramel: "#a9743f",
          terracotta: "#bd7e54",
          taupe: "#d8c1ad",
          cream: "#f3ead9",
          sand: "#e7d6bf",
          linen: "#faf4ea",
        },
        // Version 3 — New England floral (scheme3: romantic blue delphinium)
        v3: {
          ink: "#33475b",
          delft: "#5f7fa6",
          periwinkle: "#8ba4c9",
          powder: "#bccfe3",
          haze: "#dde7f2",
          sage: "#9fb09a",
          white: "#fbfcfe",
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
