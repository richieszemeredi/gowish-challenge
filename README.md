# Gowish

A wishlist app for gift-givers: view a friend's list and reserve gifts so nobody buys the same one.

## Requirements

- Node `^22.12.0` or `^24.0.0`
- npm `>=11.0.0` (bundled with Node 24)
- [nvm](https://github.com/nvm-sh/nvm) (optional): `nvm use` picks the Node version from `.nvmrc`

## Run

```sh
npm install
npm run dev
```

## Decisions

- Reservations are not that instant: we show a loading state and then the actual state once the request goes through.
- On conflict the card state is restored, and we show a descriptive toast about the error.
- Loading is handled with skeletons, and stale data is avoided with polling.
- Validations were based on personal preferences.
- On failures there's always a retry button.

## With more time

- Go deeper into testing. The tests are there for the AI agent's confirmation only at the moment, and only unit/integration.
- Pagination, virtual lists and lazy loading.
- Server-side filtering and sorting.

## Not happy with

- Code organisation is bad. On a small app like this it's okay, but it is not usable for a big application. If further development is required, I would move files into more directories straight away.
- Polling will be hard on the server with a large number of clients; there are better tools for this.
