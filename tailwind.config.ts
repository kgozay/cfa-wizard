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
        "background-elevated": "var(--background-elevated)",
        foreground: "var(--foreground)",
        surface: {
          DEFAULT: "var(--surface)",
          solid: "var(--surface-solid)",
          raised: "var(--surface-raised)",
          interactive: "var(--surface-interactive)",
          card: "var(--surface-solid)",
          elevated: "var(--surface-raised)",
          highlight: "var(--surface-interactive)",
        },
        glass: {
          surface: "var(--glass-surface)",
          "surface-strong": "var(--glass-surface-strong)",
          highlight: "var(--glass-highlight)",
        },
        border: {
          DEFAULT: "var(--border)",
          strong: "var(--border-strong)",
          subtle: "var(--divider)",
          muted: "var(--border)",
        },
        divider: "var(--divider)",
        control: {
          boundary: "var(--control-boundary)",
          "boundary-hover": "var(--control-boundary-hover)",
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
          neon: "#CAE98A",
          dim: "#9FBE61",
          glow: "rgba(184, 216, 120, 0.18)",
        },
        editorial: {
          white: "#F2F6F3",
          muted: "#9EAAA3",
          steely: "#C3CEC7",
          dim: "#52525B",
          dark: "#1B2721",
        },
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
      },
      fontFamily: {
        sans: ["var(--font-ibm-plex-sans)", "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "system-ui", "sans-serif"],
        mono: ["var(--font-ibm-plex-mono)", '"SFMono-Regular"', "Consolas", '"Liberation Mono"', "monospace"],
      },
      boxShadow: {
        "lime-glow": "0 8px 24px -12px rgba(184, 216, 120, 0.35)",
        "lime-sm": "0 4px 12px -8px rgba(184, 216, 120, 0.3)",
        "panel-dark": "0 20px 40px -15px rgba(0, 0, 0, 0.8)",
        "glass": "var(--glass-shadow)",
        "glass-soft": "var(--glass-shadow-soft)",
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
