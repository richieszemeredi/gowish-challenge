import { flushSync } from "react-dom";

// Runs a state update inside a view transition, so cards that enter, leave
// or move are animated by the browser. Without support, or when the user
// prefers reduced motion, the update simply applies instantly.
export function withViewTransition(update: () => void): void {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !("startViewTransition" in document)) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => {
    flushSync(update);
  });
  // A newer transition skips this one, which rejects its promises: expected.
  void Promise.allSettled([
    transition.ready,
    transition.finished,
    transition.updateCallbackDone,
  ]);
}
