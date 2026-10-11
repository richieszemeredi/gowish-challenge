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
          className="flex animate-pulse flex-col overflow-hidden rounded-card border border-line bg-card"
        >
          <div className="aspect-4/3 bg-paper-deep" />
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex flex-col gap-1">
              <span className="flex h-6 items-center">
                <span className="h-4 w-3/4 rounded-full bg-paper-deep" />
              </span>
              <span className="flex h-6 items-center">
                <span className="h-4 w-16 rounded-full bg-paper-deep" />
              </span>
            </div>
            <span className="mt-auto h-9 w-full rounded-full bg-paper-deep" />
          </div>
        </li>
      ))}
    </ul>
  );
}
