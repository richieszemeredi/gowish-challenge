export function StatusMessage({
  visible = true,
  children,
}: {
  visible?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span
      aria-hidden={visible ? undefined : true}
      className={`motion-safe:transition-opacity motion-safe:duration-300 motion-safe:starting:opacity-0 ${visible ? "" : "opacity-0"}`}
    >
      {children}
    </span>
  );
}
