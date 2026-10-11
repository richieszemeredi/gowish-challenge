export function WishListSkeleton(): React.JSX.Element {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading wishes"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <li
          key={i}
          className="animate-pulse overflow-hidden rounded-card border border-line bg-card"
        >
          <div className="aspect-4/3 bg-paper-deep" />
          <div className="flex flex-col gap-3 p-4">
            <span className="h-4 w-3/4 rounded-full bg-paper-deep" />
            <span className="h-4 w-16 rounded-full bg-paper-deep" />
          </div>
        </li>
      ))}
    </ul>
  );
}
