/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bps: {
          blue: '#0284c7',
          darkBlue: '#0369a1',
          orange: '#f97316',
          darkOrange: '#ea580c',
          navy: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
