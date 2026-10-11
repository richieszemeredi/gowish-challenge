# Gowish — gift-giver wishlist

A wishlist app, **gift-giver side**: you view a friend's wishlist and reserve gifts so nobody else buys the same one. You can also add items to the list (`addItem`).

The backend is a mock in `src/api.ts` (in-memory, no network). Treat its behaviour as the contract a real API would follow.

## Stack

React 19, TypeScript (strict), Vite, Tailwind CSS v4, Vitest browser mode (Playwright, real Chromium) + `vitest-browser-react`. Planned: TanStack Query for server state.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run typecheck` / `npm run lint` / `npm run format:check`
- `npm test` — Vitest in headless Chromium, single run (`npm run test:watch` to iterate). First run on a machine needs `npx playwright install chromium`.

Before finishing a change, `typecheck`, `lint`, `format:check` and `test` must all pass. Use `npm run format` / `lint:fix` rather than hand-fixing style.

## Layout

- `src/api.ts` — mock backend and `WishItem` type
- `src/components/` — UI components (`Panel`, `Header`, …)
- `src/test/setup.ts` — Vitest setup (loads the real CSS; resets reduced-motion per test)
- `src/test/animations.ts` — helpers to assert running CSS transitions/animations
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

## Visual style (already established — extend it, don't reinvent)

Soft, friendly, pastel "paper" look, set up in `src/index.css` and the existing `App`/`Header`/`Panel`:

- **Surface:** warm off-white paper (`bg-paper`, `bg-card`) with soft radial colour washes (coral, sky, mint) and a light film grain overlay on `body::after`. Don't add opaque full-bleed backgrounds that hide it.
- **Palette:** ink text (`text-ink`, secondary `text-ink-soft`), hairlines `border-line`, and pastel accents `coral`, `mint`, `sky`, `butter` each with a `-soft` tint. Use accents semantically and consistently, e.g. mint for available or yours, butter or coral for reserved or conflict. Never use raw hex or default Tailwind colours; add new tokens to `@theme` if one is truly needed.
- **Shape and depth:** large rounded cards (`rounded-card`, 1.75rem), `shadow-soft`, an opaque `bg-card` and a thin `border-white/70`. Content is a centered column (`max-w-3xl`) with generous spacing (`gap-8`, `p-5 sm:p-7`).
- **Type:** `font-display` (rounded) for headings, bold with tight tracking; `font-sans` system stack for body. No web fonts.
- **Layout:** mobile-first, enhanced at `sm:`; use `min-h-dvh`, not `100vh`.
- **Focus:** the global `:focus-visible` sky outline is the focus style. Don't remove or override it.
- Compose UI from `Panel` and small components rather than repeating card classes; Tailwind classes are auto-sorted by Prettier, so run `npm run format`.

## Conventions

- Function components with explicit return types (`React.JSX.Element`), named exports, no default exports.
- Prefer composition and small components; keep state as local as possible.
- UI copy is **English**.
- **Accessibility is a requirement (WCAG AA)**; `eslint-plugin-jsx-a11y` is strict, so don't disable its rules. Use semantic elements, visible focus, sufficient contrast, and announce async results (reservation success/conflict/error) via a live region (`role="status"` / `role="alert"`).
- Don't suppress lint or type errors (`eslint-disable`, `@ts-ignore`, `any`) to get green; fix the cause.

## Testing

- Every feature ships with tests (Vitest browser mode + `vitest-browser-react`, real CSS in real Chromium). Test behaviour through the UI the way a user would (locators by role/label, retrying `expect.element(...)`), not implementation details.
- **Animation is a first-class behaviour.** Assert it for real: use `src/test/animations.ts` (`transitionsOf`, `keyframesOf`, `finished`, `style`) to check that a transition runs when it should (new list rows, messages, icon swaps), that it ends in the right state, and that it does not run on first load or under `commands.setReducedMotion(true)`.
- **Prefer integration tests.** Render `<App />` (or the whole feature with its real query provider, hooks and child components) and drive it with `user-event`: load the list, reserve, hit a conflict, retry. Don't stub child components or hooks. Write isolated unit tests only for pure logic (e.g. price formatting), not for components.
- Mock `@/api` at the module boundary, the only seam to fake; cover loading, success, empty, network error and `ConflictError` paths. `restoreMocks` and `unstubGlobals` are on, so don't hand-reset between tests.
- Don't rely on real timers or the mock's randomness/ghost ticks in tests; mock the API or use fake timers (`vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] })`; CSS animations run on the browser clock and are unaffected).

## Git

Conventional Commits, matching existing history: `feat(ui): …`, `test(setup): …`, `chore(lint): …`. Small, focused commits; tests land with the feature.
