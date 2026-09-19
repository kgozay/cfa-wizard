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
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          raised: "var(--surface-raised)",
          interactive: "var(--surface-interactive)",
          card: "#121215",
          elevated: "#18181B",
          highlight: "#222226",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          subtle: "#1F1F23",
          muted: "#3F3F46",
        },
        muted: {
          DEFAULT: "var(--muted)",
          strong: "var(--muted-strong)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          strong: "var(--accent-strong)",
          ink: "var(--accent-ink)",
        },
        info: "var(--info)",
        warning: "var(--warning)",
        generated: "var(--generated)",
        danger: "var(--danger)",
        brand: {
          lime: "#B8D878",
          neon: "#C8E68A",
          dim: "#9FBE61",
          glow: "rgba(184, 216, 120, 0.18)",
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
        sans: ["var(--font-plus-jakarta)", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ['"SFMono-Regular"', "Consolas", '"Liberation Mono"', "monospace"],
      },
      boxShadow: {
        "lime-glow": "0 8px 24px -12px rgba(184, 216, 120, 0.35)",
        "lime-sm": "0 4px 12px -8px rgba(184, 216, 120, 0.3)",
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
