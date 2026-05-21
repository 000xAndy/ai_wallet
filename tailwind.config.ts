/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          100: '#d9e8ff',
          200: '#bbd7ff',
          300: '#8cbfff',
          400: '#559eff',
          500: '#2e78ff',
          600: '#1658f5',
          700: '#0f44e1',
          800: '#1338b6',
          900: '#16338f',
          950: '#111c4a',
        },
      },
    },
  },
  plugins: [],
};
