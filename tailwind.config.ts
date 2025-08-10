import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Workly 브랜드 색상 (Threads 기반)
        background: '#FAFAFA',
        foreground: '#000000',
        card: '#FFFFFF',
        'card-foreground': '#000000',
        primary: '#000000',
        'primary-foreground': '#FFFFFF',
        secondary: '#F5F5F5',
        'secondary-foreground': '#000000',
        muted: '#F5F5F5',
        'muted-foreground': '#999999',
        accent: '#F5F5F5',
        'accent-foreground': '#000000',
        destructive: '#EF4444',
        'destructive-foreground': '#FFFFFF',
        border: '#D5D5D5',
        input: '#D5D5D5',
        ring: '#000000',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem', // 72px for navigation width
      },
    },
  },
  plugins: [],
}
export default config