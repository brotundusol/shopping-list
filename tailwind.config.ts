import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      animation: {
        breathing: 'breathing 10s ease infinite',
      },
      keyframes: {
        breathing: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
      backgroundSize: {
        'size-200': '200% 200%',
      },
    }
  },

  plugins: []
} as Config;
