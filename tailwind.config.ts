import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090B",
        surface: {
          DEFAULT: "#0D0D0F",
          card: "#121215",
          elevated: "#18181B",
          highlight: "#222226",
        },
        border: {
          subtle: "#1F1F23",
          strong: "#27272A",
          muted: "#3F3F46",
        },
        brand: {
          lime: "#D8FF3E",
          neon: "#CCFF00",
          dim: "#A3E635",
          glow: "rgba(216, 255, 62, 0.25)",
        },
        editorial: {
          white: "#FFFFFF",
          muted: "#71717A",
          steely: "#8E8E93",
          dim: "#52525B",
          dark: "#3F3F46",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        "lime-glow": "0 0 25px -4px rgba(216, 255, 62, 0.4)",
        "lime-sm": "0 0 12px -2px rgba(216, 255, 62, 0.3)",
        "panel-dark": "0 20px 40px -15px rgba(0, 0, 0, 0.8)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
