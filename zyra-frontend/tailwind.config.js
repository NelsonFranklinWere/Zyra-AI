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
        // Zyra Neo-Futuristic Color Palette
        'zyra': {
          'deep-navy': '#0a0e27',
          'electric-violet': '#8b5cf6',
          'cyan-blue': '#06b6d4',
          'gradient-start': '#1e293b',
          'gradient-end': '#0f172a',
          'glass-bg': 'rgba(255, 255, 255, 0.05)',
          'glass-border': 'rgba(255, 255, 255, 0.1)',
          'text-primary': '#f8fafc',
          'text-secondary': '#cbd5e1',
          'accent-glow': 'rgba(139, 92, 246, 0.3)',
          'cyan-glow': 'rgba(6, 182, 212, 0.3)',
        },
        // Legacy colors for compatibility
        'deep-space': '#0A0A0F',
        'electric-teal': '#00FFC6',
        'aurora-purple': '#7A5EFF',
        'soft-silver': '#C9CED6',
        'neon-coral': '#FF4D6D',
        'pure-white': '#FFFFFF',
        // Extended palette
        'electric-teal-dark': '#00D4A3',
        'aurora-purple-dark': '#5A3FFF',
        'neon-coral-dark': '#FF2D4D',
        'deep-space-light': '#1A1A1F',
        'soft-silver-dark': '#A9AEB6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'cyber': ['JetBrains Mono', 'monospace'],
        'display': ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'neon-glow': 'neon-glow 1.5s ease-in-out infinite',
        'cyan-pulse': 'cyan-pulse 1s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 15s ease infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00FFC6, 0 0 10px #00FFC6, 0 0 15px #00FFC6' },
          '100%': { boxShadow: '0 0 10px #00FFC6, 0 0 20px #00FFC6, 0 0 30px #00FFC6' },
        },
        'neon-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 5px #8b5cf6, 0 0 10px #8b5cf6, 0 0 15px #8b5cf6'
          },
          '50%': { 
            boxShadow: '0 0 10px #8b5cf6, 0 0 20px #8b5cf6, 0 0 30px #8b5cf6'
          }
        },
        'cyan-pulse': {
          '0%, 100%': { 
            boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4'
          },
          '50%': { 
            boxShadow: '0 0 15px #06b6d4, 0 0 25px #06b6d4'
          }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'gradient-shift': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'zyra-gradient': 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        'neon-gradient': 'linear-gradient(45deg, #8b5cf6, #06b6d4)',
        'electric-gradient': 'linear-gradient(135deg, #00FFC6 0%, #7A5EFF 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #7A5EFF 0%, #FF4D6D 100%)',
      },
      backdropBlur: {
        'cyber': '20px',
      },
      boxShadow: {
        'neon': '0 0 20px rgba(139, 92, 246, 0.3)',
        'cyan': '0 0 20px rgba(6, 182, 212, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.1)',
        'cyber': '0 20px 40px rgba(139, 92, 246, 0.2)',
      },
    },
  },
  plugins: [],
}
