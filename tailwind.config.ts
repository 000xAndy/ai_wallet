/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', '"Noto Sans SC"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Inter"', '"Noto Sans SC"', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        chinese: ['"Noto Sans SC"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1.33' }],
        'xs-plus': ['0.8125rem', { lineHeight: '1.25rem' }],
        'sm-plus': ['0.9375rem', { lineHeight: '1.5' }],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
          hover: 'var(--primary-hover)',
          active: 'var(--primary-active)',
          disabled: 'var(--primary-disabled)',
          soft: 'var(--primary-soft)',
        },
        brand: {
          secondary: 'var(--brand-secondary)',
          hover: 'var(--brand-hover)',
        },
        background: {
          DEFAULT: 'var(--background)',
        },
        surface: {
          page: 'var(--surface-page)',
          cool: 'var(--surface-cool)',
          light: 'var(--surface-light)',
          blue: 'var(--surface-blue)',
          'blue-light': 'var(--surface-blue-light)',
          'blue-dim': 'var(--surface-blue-dim)',
          'blue-info': 'var(--surface-blue-info)',
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        input: {
          DEFAULT: 'var(--input)',
          background: 'var(--input-background)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        foreground: {
          DEFAULT: 'var(--foreground)',
        },
        border: {
          DEFAULT: 'var(--border)',
        },
        ring: {
          DEFAULT: 'var(--ring)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        success: {
          DEFAULT: 'var(--success)',
          text: 'var(--success-text)',
          surface: 'var(--success-surface)',
          border: 'var(--success-border)',
          'surface-tint': 'var(--success-surface-tint)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
        },
        positive: {
          DEFAULT: 'var(--positive)',
          surface: 'var(--positive-surface)',
        },
        info: {
          border: 'var(--info-border)',
        },
        text: {
          tertiary: 'var(--text-tertiary)',
          'secondary-gray': 'var(--text-secondary-gray)',
        },
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)',
        },
        shadow: {
          card: 'var(--shadow-card-color)',
          cta: 'var(--shadow-cta-color)',
          dialog: 'var(--shadow-dialog-color)',
        },
      },
      borderRadius: {
        '10': '10px',
        '18': '18px',
        '20': '20px',
        '28': '28px',
        '34': '34px',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-md': 'var(--shadow-card-md)',
        'card-lg': 'var(--shadow-card-lg)',
        icon: 'var(--shadow-icon)',
        'cta-sm': 'var(--shadow-cta-sm)',
        cta: 'var(--shadow-cta)',
        'cta-lg': 'var(--shadow-cta-lg)',
        'nav-active': 'var(--shadow-nav-active)',
        dialog: 'var(--shadow-dialog)',
      },
      transitionTimingFunction: {
        emphasis: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '240ms',
        soft: '360ms',
        hero: '500ms',
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
};
