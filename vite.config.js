import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base должен совпадать с названием репозитория на GitHub: "/ads-board/"
export default defineConfig({
  plugins: [react()],
  base: "/ads-board/",
});
