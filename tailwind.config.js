/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./**/*.php"],
  theme: {
    extend: {
      fontFamily: {
        jost: ["Jost", "sans-serif"],
        sans: ["Jost", "sans-serif"], // Make Jost the default sans-serif font
      },
      fontWeight: {
        light: "300",
        normal: "400",
        semibold: "600",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
