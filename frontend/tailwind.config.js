/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        trainova: {
          primary: '#1E3A8A', // Royal Blue
          accent: '#FFD60A',  // Electric Yellow
          slatebg: '#F1F5F9', // Slate Gray light background
          navy: '#0F172A',    // Dark mode background
          cyan: '#38BDF8',    // Dark mode accent
          soft: '#FACC15',    // Dark mode soft yellow
        },
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
      },
      animation: {
        fadeInUp: 'fadeInUp 700ms ease-out both',
        glowPulse: 'glowPulse 2.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
