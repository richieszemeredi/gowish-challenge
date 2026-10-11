import { useRef } from "react";
import { useOutOfView } from "@/hooks/useOutOfView";
import { StickyHeader } from "./StickyHeader";

export function Header(): React.JSX.Element {
  const header = useRef<HTMLElement>(null);
  const scrolledPast = useOutOfView(header);

  return (
    <>
      <header ref={header}>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Wishlist
        </h1>
      </header>
      <StickyHeader visible={scrolledPast} />
    </>
  );
}
