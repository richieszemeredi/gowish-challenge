export function WishListSkeleton(): React.JSX.Element {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading wishes"
      className="divide-y divide-line"
    >
      {[60, 45, 70, 50].map((width) => (
        <li
          key={width}
          className="flex animate-pulse items-center justify-between gap-4 py-4"
        >
          <span
            className="h-4 rounded-full bg-paper-deep"
            style={{ width: `${String(width)}%` }}
          />
          <span className="h-4 w-16 rounded-full bg-paper-deep" />
        </li>
      ))}
    </ul>
  );
}
