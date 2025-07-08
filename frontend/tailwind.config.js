/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        pulsePingLaranja: 'pingLaranja 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        pingLaranja: {
          '75%, 100%': {
            transform: 'scale(1.75)',
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [],
}
