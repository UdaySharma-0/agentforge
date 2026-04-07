/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Deep slate colors for a "Pro" dark mode look
        slate: {
          950: "#020617",
        },
      },
      animation: {
        "shimmer": "shimmer 2s infinite linear",
        "gradient-x": "gradient-x 15s ease infinite",
        "pulse-slow": "pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "gradient-x": {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
      boxShadow: {
        'glow-indigo': '0 0 20px -5px rgba(79, 70, 229, 0.5)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.5)',
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #80808012 1px, transparent 1px), linear-gradient(to bottom, #80808012 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};