import type { Locator } from "vitest/browser";

const animationsOf = (el: Element): Animation[] => el.getAnimations();

/** Running CSS transitions of `property` on the element. */
export const transitionsOf = (
  locator: Locator,
  property: string,
): CSSTransition[] =>
  animationsOf(locator.element())
    .filter((a): a is CSSTransition => a instanceof CSSTransition)
    .filter((a) => a.transitionProperty === property);

/** Running CSS keyframe animations (e.g. the spinner) on the element. */
export const keyframesOf = (locator: Locator): CSSAnimation[] =>
  animationsOf(locator.element()).filter(
    (a): a is CSSAnimation => a instanceof CSSAnimation,
  );

export const finished = async (animations: Animation[]): Promise<void> => {
  await Promise.all(animations.map(async (a) => a.finished));
};

export const style = (locator: Locator, property: string): string =>
  getComputedStyle(locator.element()).getPropertyValue(property);
