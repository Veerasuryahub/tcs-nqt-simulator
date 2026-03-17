/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tcs: {
          blue: '#1e3a8a',
          lightBlue: '#3b82f6',
          dark: '#0f172a',
        }
      }
    },
  },
  plugins: [],
}
