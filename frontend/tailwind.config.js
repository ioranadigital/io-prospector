/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx,js,jsx}', './components/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 400: '#60a5fa', 500: '#2563eb', 600: '#1d4ed8' },
      },
    },
  },
  plugins: [],
};
