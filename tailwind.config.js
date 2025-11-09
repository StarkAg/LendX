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
        background: '#081B1B',
        foreground: '#EEE8B2',
        brown: {
          DEFAULT: '#C18D52',
          light: '#D4A574',
          dark: '#A67A42',
        },
        teal: {
          DEFAULT: '#081B1B',
          light: '#0A2525',
        },
        forest: {
          DEFAULT: '#203B37',
          light: '#2A4A45',
          dark: '#1A2F2B',
        },
        sage: {
          DEFAULT: '#5A8F76',
          light: '#6BA085',
          dark: '#4A7A63',
        },
        mint: {
          DEFAULT: '#96CDB0',
          light: '#A8D8C0',
          dark: '#84BFA0',
        },
        border: 'rgba(150, 205, 176, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.6' }],
        'base': ['1rem', { lineHeight: '1.6' }],
        'lg': ['1.125rem', { lineHeight: '1.6' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.4' }],
        '3xl': ['1.875rem', { lineHeight: '1.3' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.3)',
        'soft': '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
