/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          rose: '#F43F5E',      // Rose Red
          purple: '#21005D',    // Deep Velvet Purple
          yellow: '#F59E0B',    // Gold Yellow
          secondary: '#FB7185', // RedPen Secondary
        },
        bg: {
          lavender: '#FEF7FF',  // Light Lavender
          violet: '#F3E8FF',    // Pastel Violet
          container: '#E8DEF8', // Lavender Container
          gray: '#E7E0EC',      // Dust Lavender Gray
          paper: '#FEFDF0',     // Graded Paper Pink
        },
        neutral: {
          charcoal: '#1D1B20',  // Charcoal Black
          slate: '#49454F',     // Muted Slate
          outline: '#CAC4D0',   // Muted Outline
        }
      },
      fontSize: {
        'hero-hook': ['22px', { lineHeight: '28px' }],
        'logo-title': ['16px', { lineHeight: '20px' }],
        'widget-title': ['12px', { lineHeight: '16px' }],
        'body-text': ['13px', { lineHeight: '18px' }],
        'tag-sub': ['10px', { lineHeight: '12px' }],
      }
    },
  },
  plugins: [],
}
