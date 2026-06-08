/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0f0d',
          900: '#0f1613',
          850: '#141d19',
          800: '#1b2722',
          700: '#26352e',
        },
        pitch: {
          400: '#34e89e',
          500: '#10c97e',
          600: '#0a9e63',
        },
        gold: {
          400: '#ffcb45',
          500: '#f5b417',
        },
        live: '#ff5a5f',
        line: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          strong: '#7c8b84',
        },
      },
      fontFamily: {
        display: ['Archivo', 'system-ui', 'sans-serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        score: ['"Saira Condensed"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn .35s ease-out',
        'slide-up': 'slideUp .3s cubic-bezier(.16,1,.3,1)',
        'ping-slow': 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        fadeIn: { from: { transform: 'translateY(7px)' }, to: { transform: 'translateY(0)' } },
        slideUp: {
          from: { opacity: '0', transform: 'translate(-50%, 12px)' },
          to: { opacity: '1', transform: 'translate(-50%, 0)' },
        },
      },
    },
  },
  plugins: [],
}
