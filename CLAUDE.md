# Gowish — gift-giver wishlist

A wishlist app, **gift-giver side**: you view a friend's wishlist and reserve gifts so nobody else buys the same one. You can also add items to the list (`addItem`).

The backend is a mock in `src/api.ts` (in-memory, no network). Treat its behaviour as the contract a real API would follow.

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS v4, Vitest + Testing Library (jsdom). Planned: TanStack Query for server state.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` / `npm run lint` / `npm run format:check`
- `npm test` — Vitest, single run (`npm run test:watch` to iterate)

Before finishing a change, `typecheck`, `lint`, `format:check` and `test` must all pass. Use `npm run format` / `lint:fix` rather than hand-fixing style.

## Layout

- `src/api.ts` — mock backend and `WishItem` type
- `src/components/` — UI components (`Panel`, `Header`, …)
- `src/test/setup.ts` — Vitest setup
- Import via the `@` alias (`@/components/Panel`) for `src/`
- Theme tokens (colours, radii, shadows, fonts) live in `src/index.css` under `@theme`. Use those tokens (`bg-card`, `text-ink-soft`, `rounded-card`, `shadow-soft`) instead of ad-hoc values.

## Domain rules (`src/api.ts`)

- Prices are **minor units** (`priceMinor`, øre) in **DKK**. Never store or compute with floats; format for display with `Intl.NumberFormat("da-DK", { style: "currency", currency: "DKK" })` using `priceMinor / 100`.
- `reservedBy: string | null` — `null` is free. The current user is `CURRENT_USER` (`"you"`).
- `reserveItem` throws `ConflictError` (carries the up-to-date `item`) if someone else holds it; `unreserveItem` throws `ConflictError` if you don't hold it; both throw `NotFoundError` for unknown ids. Reserving an item you already hold is a no-op success.
- Every call has 200–800 ms latency and `getItems`/`addItem` fail randomly (~10% / ~5%) with `Error("Network error")`. UI must handle loading, error and retry states — don't assume success.
- Other people reserve and release items in the background (`ghostTick`, every ~8–15 s). The list can go stale at any moment, so data must be refetched/polled and conflicts expected.

## Data fetching and reservation UX

- Use **TanStack Query** for all `api.ts` calls; no ad-hoc `useEffect` fetching. Poll/refetch the list so other people's reservations show up.
- Reserving/unreserving is **optimistic with rollback**: update the UI immediately, and on error revert to the previous state.
  - On `ConflictError`, roll back to `error.item` (the server's truth) and tell the user someone else got there first — not a generic error.
  - On a network error, roll back and offer retry.
  - Always refetch (`onSettled`) so the cache converges on the server.
- Disable or mark in-flight items to prevent double submits; one item's pending state must not block the others.
- Reserved-by-others items are visibly unavailable (show who, since it's a friend group); items you hold offer "unreserve".

## Conventions

- Function components with explicit return types (`React.JSX.Element`), named exports, no default exports.
- Prefer composition and small components; keep state as local as possible.
- UI copy is **English**.
- **Accessibility is a requirement (WCAG AA)**; `eslint-plugin-jsx-a11y` is strict, so don't disable its rules. Use semantic elements, visible focus, sufficient contrast, and announce async results (reservation success/conflict/error) via a live region (`role="status"` / `role="alert"`).
- Don't suppress lint or type errors (`eslint-disable`, `@ts-ignore`, `any`) to get green; fix the cause.

## Testing

- Every feature ships with tests (Vitest + Testing Library + `user-event`). Test behaviour through the UI the way a user would (queries by role/label), not implementation details.
- Mock `@/api` at the module boundary; cover loading, success, empty, network error and `ConflictError` paths. `restoreMocks` and `unstubGlobals` are on, so don't hand-reset between tests.
- Don't rely on real timers or the mock's randomness/ghost ticks in tests; mock the API or use fake timers.

## Git

Conventional Commits, matching existing history: `feat(ui): …`, `test(setup): …`, `chore(lint): …`. Small, focused commits; tests land with the feature.
