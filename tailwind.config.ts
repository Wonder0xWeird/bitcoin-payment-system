import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bitcoin: {
          DEFAULT: '#f7931a',
          50: '#fef9f3',
          100: '#fef1e3',
          200: '#fce0c2',
          300: '#f9c896',
          400: '#f5a769',
          500: '#f7931a',
          600: '#e8851b',
          700: '#c06a15',
          800: '#9c5518',
          900: '#7f4716',
        },
        orange: {
          DEFAULT: '#f7931a',
          50: '#fef9f3',
          100: '#fef1e3',
          200: '#fce0c2',
          300: '#f9c896',
          400: '#f5a769',
          500: '#f7931a',
          600: '#e8851b',
          700: '#c06a15',
          800: '#9c5518',
          900: '#7f4716',
        },
      },
    },
  },
  plugins: [],
}

export default config 