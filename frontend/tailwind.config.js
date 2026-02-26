/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        obsidian: {
          950: '#080a0f',
          900: '#0d1117',
          800: '#161b22',
          700: '#1c2128',
          600: '#21262d',
          500: '#30363d',
          400: '#484f58',
        },
        neon: {
          green: '#39d353',
          blue: '#58a6ff',
          purple: '#bc8cff',
          orange: '#f78166',
          yellow: '#d29922',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-10px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseGlow: { '0%, 100%': { boxShadow: '0 0 5px rgba(88,166,255,0.3)' }, '50%': { boxShadow: '0 0 20px rgba(88,166,255,0.6)' } },
      },
    },
  },
  plugins: [],
}
