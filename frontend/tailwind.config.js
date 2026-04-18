export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#060a12',
          800: '#0d1220',
          700: '#151c2e',
          600: '#1e2540',
        },
        accent: {
          50: '#eef4ff',
          100: '#dce8ff',
          200: '#b9d1ff',
          300: '#8eb4ff',
          400: '#5e8eff',
          500: '#356cff',
          600: '#1f4fe6',
          700: '#1c3fb8',
          800: '#1a358f',
          900: '#172e6f',
        },
        threat: {
          red: '#ef3b3b',
          orange: '#f59e0b',
          amber: '#eab308',
          green: '#16a34a',
          blue: '#2563eb',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Menlo', 'monospace'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-0.04em',
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(15,23,42,0.04), 0 4px 14px rgba(15,23,42,0.06)',
        'ring': '0 0 0 1px rgba(15,23,42,0.06)',
        'lift': '0 8px 30px rgba(15,23,42,0.08)',
        'accent': '0 10px 30px rgba(53,108,255,0.25)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)",
        'grid-dark': "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      animation: {
        'shimmer': 'shimmer 2.5s linear infinite',
        'marquee': 'marquee 40s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
