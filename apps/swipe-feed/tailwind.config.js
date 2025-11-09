/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#0f172a",
        aurora: "#6366f1",
        accent: "#14b8a6",
      },
    },
  },
  plugins: [],
};

