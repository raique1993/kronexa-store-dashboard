/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#6C3FE8', dark: '#5530c4' },
        cyan: { brand: '#00E5FF' },
        dark: { DEFAULT: '#08081A', card: '#12122A', hover: '#1a1a35' }
      }
    }
  },
  plugins: []
}
