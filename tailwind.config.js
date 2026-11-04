/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Multi-Color Brand System Tokens
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#E8EEFF',
          tint: '#EFF6FF',
          border: '#BFDBFE',
          dark: '#1E40AF',
        },
        violet: {
          DEFAULT: '#7C3AED',
          hover: '#6D28D9',
          light: '#F1EAFF',
          tint: '#F5F3FF',
          border: '#DDD6FE',
          dark: '#5B21B6',
        },
        teal: {
          DEFAULT: '#0D9488',
          hover: '#0F766E',
          light: '#CCFBF1',
          tint: '#F0FDFA',
          border: '#99F6E4',
          dark: '#115E59',
        },
        amber: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          light: '#FEF3C7',
          tint: '#FFFBEB',
          border: '#FDE68A',
          dark: '#B45309',
        },
        brand: {
          50: '#f4f7fc',
          100: '#e8eeff',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
          800: '#172033',
          900: '#0f172a',
          950: '#020617',
        },
        slate: {
          850: '#151f32',
          900: '#0f172a',
          950: '#020617',
        },
        // BAMA Semantic Tokens with SaaS Multi-Color Scheme
        surface: {
          canvas: '#F4F7FC',
          base: '#FFFFFF',
          raised: '#F8FAFC',
          overlay: '#FFFFFF',
          card: '#FFFFFF',
          subtle: '#F1F5F9',
          muted: '#E2E8F0',
        },
        content: {
          primary: '#172033',
          secondary: '#475569',
          muted: '#64748B', // WCAG AA compliant on white (4.6:1)
          inverse: '#FFFFFF',
        },
        border: {
          default: '#E2E8F0',
          subtle: '#F1F5F9',
          strong: '#CBD5E1',
          interactive: '#2563EB',
        },
        status: {
          success: {
            DEFAULT: '#16A34A',
            light: '#ECFDF5',
            border: '#A7F3D0',
            text: '#15803D',
          },
          warning: {
            DEFAULT: '#D97706',
            light: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          error: {
            DEFAULT: '#DC2626',
            light: '#FEF2F2',
            border: '#FECACA',
            text: '#B91C1C',
          },
          info: {
            DEFAULT: '#2563EB',
            light: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
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
        card: '0 1px 3px 0 rgb(23 32 51 / 0.06), 0 1px 2px -1px rgb(23 32 51 / 0.04)',
        elevated: '0 10px 15px -3px rgb(23 32 51 / 0.08), 0 4px 6px -4px rgb(23 32 51 / 0.04)',
        modal: '0 20px 25px -5px rgb(23 32 51 / 0.12), 0 8px 10px -6px rgb(23 32 51 / 0.08)',
        glow: '0 0 25px -5px rgba(37, 99, 235, 0.25)',
      },
    },
  },
  plugins: [],
};
