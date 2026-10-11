export function Panel({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="rounded-card border border-white/70 bg-paper p-5 shadow-soft sm:p-7">
      {children}
    </section>
  );
}
