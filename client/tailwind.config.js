/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Britpop/Mod Theme Colors - Oasis/Beatles Aesthetic
        'quiz-blue': '#003DA5',        // Royal Blue (Union Jack)
        'quiz-red': '#D32F2F',         // British Red
        'quiz-light-blue': '#4A90E2',  // Light Blue
        'quiz-navy': '#001F3F',        // Navy Blue
        'mod-red': '#C8102E',          // Union Jack Red
        'mod-blue': '#00247D',         // Union Jack Blue (Deep)
        'quiz-white': '#FFFFFF',
        'quiz-gray': '#F5F5F5',
        // Retro/Vintage Colors
        'retro-yellow': '#FFD700',     // Vintage Gold/Yellow (Think Yellow Submarine)
        'retro-orange': '#FFA500',     // Vintage Orange
        'retro-cream': '#FAF3E0',      // Vintage Cream/Beige
        'vintage-cream': '#F5F3EE',    // Aged Paper
        'british-green': '#006341',    // British Racing Green
        'mod-black': '#1a1a1a',        // Vintage Black
        'vinyl-black': '#0a0a0a',      // Deep Black (Vinyl Record)
      },
      fontFamily: {
        'sans': ['Helvetica Neue', 'Arial', 'sans-serif'],
        'heading': ['Impact', 'Oswald', 'Arial Black', 'sans-serif'], // Bold condensed fonts like classic rock posters
      },
      boxShadow: {
        'britpop': '6px 6px 0 rgba(200, 16, 46, 0.4), 12px 12px 0 rgba(0, 61, 165, 0.2)',
        'brutal': '8px 8px 0 rgba(0, 0, 0, 0.8)',         // Hard shadow (punk aesthetic)
        'vinyl': '0 8px 32px rgba(0, 0, 0, 0.3)',         // Vinyl record shadow
      }
    },
  },
  plugins: [],
}
