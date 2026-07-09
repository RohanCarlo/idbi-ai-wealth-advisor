import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f9f8",
          100: "#e6f3f0",
          200: "#bfe0da",
          300: "#8cc7bd",
          400: "#4ca898",
          500: "#00836c",
          600: "#00735f",
          700: "#005e4e",
          800: "#004c3f",
          900: "#00372d",
        },
        accent: {
          50: "#fef9f4",
          100: "#fef2e9",
          200: "#fce0c7",
          300: "#fac79b",
          400: "#f8a863",
          500: "#f58220",
          600: "#d8721c",
          700: "#b05e17",
          800: "#8e4b13",
          900: "#67370d",
        },
        surface: "var(--surface)",
        "surface-card": "var(--surface-card)",
        "surface-elevated": "var(--surface-elevated)",
        "surface-sidebar": "var(--surface-sidebar)",
        content: {
          DEFAULT: "var(--content)",
          2: "var(--content-2)",
          3: "var(--content-3)",
          4: "var(--content-4)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          2: "var(--outline-2)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.95)", opacity: "1" },
          "100%": { transform: "scale(1.2)", opacity: "0" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 8px rgb(0 131 108 / 0.4)" },
          "50%": { boxShadow: "0 0 24px rgb(0 131 108 / 0.7)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "pulse-ring": "pulse-ring 1.5s ease-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "bounce-in": "bounce-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        glow: "glow 2s ease-in-out infinite",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #00836c 0%, #00735f 100%)",
        "gradient-accent": "linear-gradient(135deg, #f58220 0%, #d8721c 100%)",
        "gradient-green": "linear-gradient(135deg, #059669 0%, #10b981 100%)",
        "gradient-red": "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
        "gradient-purple": "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
        "gradient-amber": "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
