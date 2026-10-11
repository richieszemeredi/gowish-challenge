import { commands } from "vitest/browser";
import "../index.css";

// Each test starts with motion enabled; tests opt in to reduced motion.
afterEach(() => {
  vi.useRealTimers();
});

beforeEach(async () => {
  await commands.setReducedMotion(false);
});
