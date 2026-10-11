export function StickyHeader({
  visible,
}: {
  visible: boolean;
}): React.JSX.Element {
  return (
    <div
      aria-hidden="true"
      className={`fixed inset-x-0 top-0 z-10 border-b border-line bg-card/70 px-4 py-3 text-center font-display font-bold tracking-tight backdrop-blur-md motion-safe:transition-opacity motion-safe:duration-300 ${visible ? "" : "pointer-events-none opacity-0"}`}
    >
      Wishlist
    </div>
  );
}
