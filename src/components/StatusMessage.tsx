export function StatusMessage({
  visible = true,
  className = "",
  children,
}: {
  visible?: boolean;
  className?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <span
      aria-hidden={visible ? undefined : true}
      inert={!visible}
      className={`motion-safe:transition-opacity motion-safe:duration-300 motion-safe:starting:opacity-0 ${visible ? "" : "opacity-0"} ${className}`}
    >
      {children}
    </span>
  );
}
