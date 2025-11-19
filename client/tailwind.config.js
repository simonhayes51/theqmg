/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Britpop/Mod Theme Colors
        'quiz-blue': '#003DA5',        // Royal Blue
        'quiz-red': '#D32F2F',         // British Red
        'quiz-light-blue': '#4A90E2',  // Light Blue
        'quiz-navy': '#001F3F',        // Navy Blue
        'mod-red': '#C8102E',          // Union Jack Red
        'mod-blue': '#00247D',         // Union Jack Blue
        'quiz-white': '#FFFFFF',
        'quiz-gray': '#F5F5F5',
      },
      fontFamily: {
        'sans': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'heading': ['Impact', 'Arial Black', 'sans-serif'],
      },
      boxShadow: {
        'britpop': '0 4px 6px -1px rgba(0, 61, 165, 0.1), 0 2px 4px -1px rgba(211, 47, 47, 0.06)',
      }
    },
  },
  plugins: [],
}
