/** @type {import('tailwindcss').Config} */
const withVar = (name) => `var(${name})`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: withVar("--color-bg"),
        surface: withVar("--color-surface"),
        text: withVar("--color-text"),
        muted: withVar("--color-text-muted"),
        accent: withVar("--color-accent"),
        accent2: withVar("--color-accent-2"),
        danger: withVar("--color-danger"),
        warning: withVar("--color-warning"),
        success: withVar("--color-success"),
        midnight: withVar("--color-bg"),
        aurora: withVar("--color-accent"),
      },
      borderRadius: {
        DEFAULT: withVar("--radius"),
        lg: withVar("--radius-lg"),
      },
      boxShadow: {
        sm: withVar("--shadow-1"),
        lg: withVar("--shadow-2"),
      },
      fontFamily: {
        heading: withVar("--ff-heading"),
        body: withVar("--ff-body"),
      },
      fontSize: {
        display: withVar("--fs-1"),
        h2: withVar("--fs-2"),
        body: withVar("--fs-3"),
        small: withVar("--fs-4"),
      },
    },
  },
  plugins: [],
};

