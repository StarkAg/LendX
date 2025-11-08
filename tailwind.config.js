/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        foreground: '#f5f5f5',
        gold: {
          DEFAULT: '#d4af37',
          light: '#f4d03f',
          dark: '#b8941a',
        },
        dark: {
          DEFAULT: '#1a1a1a',
          medium: '#2a2a2a',
          light: '#3a3a3a',
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #d4af37 0%, #f4d03f 100%)',
        'gradient-dark': 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)',
      },
      boxShadow: {
        'gold': '0 4px 15px rgba(212, 175, 55, 0.3)',
        'gold-lg': '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)',
        'premium': '0 12px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(212, 175, 55, 0.2)',
      },
    },
  },
  plugins: [],
}
