import { useEffect, useState, type RefObject } from "react";

// True once the referenced element has scrolled out of the viewport.
export const useOutOfView = (ref: RefObject<Element | null>): boolean => {
  const [outOfView, setOutOfView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setOutOfView(!entry.isIntersecting);
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return outOfView;
};
