/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        charity: {
          light: '#f0fdf4', 
          DEFAULT: '#22c55e', 
          dark: '#166534',
        }
      }
    },
  },
  plugins: [],
}