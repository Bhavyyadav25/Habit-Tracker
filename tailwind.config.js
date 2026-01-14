/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
          950: "#1e1b4b",
        },
        surface: {
          light: "#ffffff",
          "light-secondary": "#f8fafc",
          dark: "#0f172a",
          "dark-secondary": "#1e293b",
        },
      },
      animation: {
        "confetti": "confetti 0.5s ease-out forwards",
        "check": "check 0.3s ease-out forwards",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
        "bounce-in": "bounce-in 0.5s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-out forwards",
        "flame": "flame 0.5s ease-in-out infinite alternate",
        "level-up": "level-up 0.6s ease-out forwards",
        "xp-fill": "xp-fill 1s ease-out forwards",
      },
      keyframes: {
        confetti: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(180deg)", opacity: "0" },
        },
        check: {
          "0%": { transform: "scale(0)", opacity: "0" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "bounce-in": {
          "0%": { transform: "scale(0.3)", opacity: "0" },
          "50%": { transform: "scale(1.05)" },
          "70%": { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        flame: {
          "0%": { transform: "scale(1) rotate(-2deg)" },
          "100%": { transform: "scale(1.1) rotate(2deg)" },
        },
        "level-up": {
          "0%": { transform: "scale(0) rotate(-180deg)", opacity: "0" },
          "50%": { transform: "scale(1.3) rotate(10deg)" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "xp-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--xp-width)" },
        },
      },
    },
  },
  plugins: [],
};
