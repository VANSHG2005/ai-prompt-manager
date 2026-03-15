/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        sans:    ['"Geist"', '"Helvetica Neue"', 'sans-serif'],
        mono:    ['"DM Mono"', '"Courier New"', 'monospace'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        body:    ['"Geist"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
