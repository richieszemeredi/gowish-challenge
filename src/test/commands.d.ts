declare module "vitest/internal/browser" {
  type BrowserCommands = {
    setReducedMotion: (reduce: boolean) => Promise<void>;
  };
}

export {};
