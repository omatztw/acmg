import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES // この行を追加
    ? "acmg" // この行を追加
    : "./", // この行を追加
});
