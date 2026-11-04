/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#334155',
          700: '#1e293b',
          800: '#0f172a',
          900: '#020617',
          950: '#000000',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#020617',
        },
        // BAMA Semantic Tokens
        surface: {
          base: '#ffffff',
          raised: '#f8fafc',
          overlay: '#ffffff',
          card: '#ffffff',
          subtle: '#f1f5f9',
          muted: '#e2e8f0',
        },
        content: {
          primary: '#0f172a',
          secondary: '#334155',
          muted: '#64748b', // WCAG AA compliant on white (4.6:1)
          inverse: '#ffffff',
        },
        border: {
          default: '#e2e8f0',
          subtle: '#f1f5f9',
          strong: '#94a3b8',
          interactive: '#0f172a',
        },
        status: {
          success: {
            DEFAULT: '#059669',
            light: '#ecfdf5',
            border: '#a7f3d0',
            text: '#065f46',
          },
          warning: {
            DEFAULT: '#d97706',
            light: '#fffbeb',
            border: '#fde68a',
            text: '#92400e',
          },
          error: {
            DEFAULT: '#e11d48',
            light: '#fff1f2',
            border: '#fecdd3',
            text: '#9f1239',
          },
          info: {
            DEFAULT: '#2563eb',
            light: '#eff6ff',
            border: '#bfdbfe',
            text: '#1e40af',
          },
        },
      },
      borderRadius: {
        'radius-xs': '4px',
        'radius-sm': '8px',
        'radius-md': '12px',
        'radius-lg': '16px',
        'radius-xl': '24px',
        // Maintain legacy aliases safely
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      transitionDuration: {
        quick: '100ms',
        standard: '150ms',
        smooth: '200ms',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Cal Sans',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        subtle: '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        card: '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        elevated: '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
        modal: '0 20px 25px -5px rgb(0 0 0 / 0.12), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
        glow: '0 0 25px -5px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
};
