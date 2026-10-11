import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { playwright } from "@vitest/browser-playwright";
import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  test: {
    globals: true,
    exclude: [...configDefaults.exclude, ".claude/worktrees/**"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: "chromium" }],
      commands: {
        // Emulates the OS "reduce motion" preference for the test page.
        setReducedMotion: async (ctx, reduce: boolean) => {
          await ctx.page.emulateMedia({
            reducedMotion: reduce ? "reduce" : "no-preference",
          });
        },
      },
    },
  },
});
