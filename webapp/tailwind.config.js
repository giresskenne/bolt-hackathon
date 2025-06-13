/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        'primary-light': '#60A5FA',
        'primary-dark': '#1D4ED8',
        'discord-start': '#0b143a',
        'discord-end': '#2857ff'
      },
      backgroundImage: {
        'discord-hero': 'linear-gradient(135deg, #0b143a 23%, #0b143a 23%, #2857ff 100%)'
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'bounce-slow': 'bounce-slow 3s ease-in-out infinite',
        'float-badge': 'float-badge 4s ease-in-out infinite',
        'float-badge-delay': 'float-badge 4s ease-in-out infinite 2s',
      },
      keyframes: {
        bounce: {
          '0%, 100%': { transform: 'translateY(-10%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'bounce-slow': {
          '0%, 100%': { transform: 'translateY(-2%)' },
          '50%': { transform: 'translateY(0)' },
        },
        'float-badge': {
          '0%, 100%': { transform: 'translateY(-15%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    }
  },
  plugins: []
}