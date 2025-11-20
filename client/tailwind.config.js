/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Britpop/Mod Color Palette - Oasis/Beatles Energy
        'brit-red': '#DC143C',      // British Racing Red
        'brit-blue': '#003DA5',     // Royal Blue / Mod Blue
        'brit-navy': '#00247D',     // Deep Union Jack Blue
        'brit-gold': '#FFB700',     // Yellow Submarine Gold
        'brit-green': '#006341',    // British Racing Green
        'mod-white': '#F8F8F8',     // Clean White
        // Quiz aliases (for backward compatibility)
        'quiz-red': '#DC143C',      // Same as brit-red
        'quiz-blue': '#003DA5',     // Same as brit-blue
        'quiz-gray': '#f3f4f6',     // Light gray for admin backgrounds
        'mod-blue': '#003DA5',      // Same as brit-blue
      },
      fontFamily: {
        'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'heading': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 40px rgba(220, 20, 60, 0.5), 0 0 80px rgba(220, 20, 60, 0.3)',
        'glow-blue': '0 0 40px rgba(0, 61, 165, 0.5), 0 0 80px rgba(0, 61, 165, 0.3)',
        'glow-gold': '0 0 40px rgba(255, 183, 0, 0.5), 0 0 80px rgba(255, 183, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
