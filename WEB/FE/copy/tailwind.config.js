/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          700: '#7c3aed',
          900: '#581c87'
        }
      }
    },
  },
  plugins: [],
} 