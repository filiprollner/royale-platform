import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0e1622',
        'ink-2': '#142135',
        'ink-3': '#1a2b45',
        rail: '#233752',
        glass: '#2a3f5d',
        felt: '#1f3b58',
        accent: '#5dd6ff',
        danger: '#ff5d7a',
        success: '#36d399',
        'card-red': '#ff6b6b',
        'card-blue': '#6ba8ff',
      },
      boxShadow: {
        'floating': '0 12px 30px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.05)',
        'innerRail': 'inset 0 8px 24px rgba(0,0,0,.45), inset 0 -8px 24px rgba(0,0,0,.25)',
      },
      borderRadius: {
        'rail': '28px',
        'chip': '14px',
        'card': '14px',
      },
      backgroundImage: {
        'noise': "url('/noise.png')",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
        'pulse-slow': 'pulse 3s infinite',
      }
    },
  },
  plugins: [],
} satisfies Config;
