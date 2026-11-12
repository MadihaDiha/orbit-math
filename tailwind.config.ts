import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#07152F",
        deep: "#102B59",
        royal: "#1D55A6",
        neon: "#318BFF",
        ice: "#62E5F5",
        nebula: "#8D7CFF",
        soft: "#F3F7FF",
        gold: "#FFD76A",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-10px)" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        twinkle: { "0%,100%": { opacity: "0.25" }, "50%": { opacity: "1" } },
        "page-in": { from: { opacity: "0", transform: "translateY(14px) scale(0.99)" }, to: { opacity: "1", transform: "none" } },
        "pop-in": { "0%": { opacity: "0", transform: "scale(0.6)" }, "70%": { transform: "scale(1.06)" }, "100%": { opacity: "1", transform: "scale(1)" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(24px)" }, to: { opacity: "1", transform: "none" } },
        shake: { "0%,100%": { transform: "translateX(0)" }, "25%": { transform: "translateX(-6px)" }, "75%": { transform: "translateX(6px)" } },
        pulseGlow: { "0%,100%": { boxShadow: "0 0 0 0 rgba(98,229,245,0.45)" }, "50%": { boxShadow: "0 0 0 10px rgba(98,229,245,0)" } },
      },
      animation: {
        float: "float 5s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        "spin-med": "spin-slow 14s linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "page-in": "page-in 0.45s cubic-bezier(.2,.8,.2,1) both",
        "pop-in": "pop-in 0.5s cubic-bezier(.2,.8,.2,1) both",
        "slide-up": "slide-up 0.5s cubic-bezier(.2,.8,.2,1) both",
        shake: "shake 0.35s ease-in-out",
        "pulse-glow": "pulseGlow 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
