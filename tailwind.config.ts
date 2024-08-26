import type { Config } from 'tailwindcss';
import flowbite from 'flowbite-react/tailwind';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    flowbite.content(),
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {},
      keyframes: {
        'backdrop-blur': {
          '0%': {
            'backdrop-filter': 'blur(0px)',
          },
          '100%': {
            'backdrop-filter': 'blur(8px)',
          },
        },
      },
      animation: {
        'backdrop-blur': 'backdrop-blur .2s ease',
      },
      transitionProperty: {
        width: 'width',
      },
    },
  },
  plugins: [flowbite.plugin()],
};
export default config;
