import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
    port: 3000,
  },
  test: {
    // test, expect and vi are available without imports, like in the React Component Testing session
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    // the starter has no tests yet
    passWithNoTests: true,
    // the contrast test reads the real styles.css via ?raw
    css: { include: [/styles.css/] },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.{ts,tsx}"],
    },
  },
});
