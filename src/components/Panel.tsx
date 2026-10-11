export function Panel({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="rounded-card border border-white/70 bg-card/80 p-5 shadow-soft backdrop-blur-sm sm:p-7">
      {children}
    </section>
  );
}
