/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#0EA5E9',
        accent: '#14B8A6',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        bgsoft: '#F8FAFC',
        darkcard: '#0F172A',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px rgba(15, 23, 42, 0.06)',
        softer: '0 4px 16px rgba(15, 23, 42, 0.04)',
        glow: '0 0 0 1px rgba(37, 99, 235, 0.08), 0 12px 40px rgba(37, 99, 235, 0.12)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #0EA5E9 100%)',
        'gradient-accent': 'linear-gradient(135deg, #14B8A6 0%, #0EA5E9 100%)',
        'gradient-hero': 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
