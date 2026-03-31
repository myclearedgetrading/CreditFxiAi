/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          750: '#2d3748',
          850: '#1a202c',
          950: '#020617',
        },
        orange: {
          450: '#fdba74',
          550: '#f97316',
        },
      },
      screens: {
        xs: '475px',
      },
    },
  },
  plugins: [],
};
