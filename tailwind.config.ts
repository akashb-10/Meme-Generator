import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0f0f1a",
        surface: "#1a1a2e",
        surface2: "#16213e",
        accent: "#e94560",
        muted: "#888",
        border: "#2a2a4a",
      },
    },
  },
  plugins: [],
};
export default config;
