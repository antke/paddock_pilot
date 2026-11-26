# End-to-end journeys

`pnpm test:e2e` signs in as several seeded people and walks real journeys
through the real Convex server. Each journey checks both sides: the allowed
path works and the other person sees the result, and refused actions are
hidden, greyed out or explained, never offered and then failed.

## What a run does

1. Pushes `convex/` to the **e2e deployment** from a scratch folder, so your
   `.env.local` is never touched.
2. Empties that deployment (`convex/e2e.ts` `reset`). This only runs where
   `E2E_RESET_ENABLED=true`, which is set on the e2e deployment alone.
3. Creates the test people in the Clerk **development** instance
   (`pp-e2e-*+clerk_test@example.com`; Clerk never emails these addresses).
4. Seeds stables, horses, events and reminders through the public API, signed
   in as each person, with dates relative to today (`e2e/support/seed.ts`).
5. Saves one signed-in session per person in `e2e/.auth/`, then runs
   `e2e/journeys/*.e2e.ts` against a Vite server on port 9191.

Projects: `desktop` (Chromium at 1440 px) runs everything; `mobile` (WebKit at
390 px) runs the read-only journeys tagged `@mobile`.

## Setup (once)

- `.env.local` needs the Clerk test keys (`VITE_CLERK_PUBLISHABLE_KEY`,
  `CLERK_SECRET_KEY`). The suite refuses `pk_live`/`sk_live` keys.
- Create `.env.e2e.local` (it's gitignored):

  ```sh
  E2E_CONVEX_DEPLOYMENT=<e2e-deployment-name>
  E2E_CONVEX_URL=https://<e2e-deployment-name>.<region>.convex.cloud
  ```

- The e2e deployment needs these env vars: `CLERK_FRONTEND_API_URL`,
  `CLERK_SECRET_KEY`, `APP_URL=http://localhost:9191`, `DEV_SEED_ENABLED=true`
  and `E2E_RESET_ENABLED=true`. Set them with
  `npx convex env set --deployment <name> …`. Never set `E2E_RESET_ENABLED` on
  dev or prod.
- For a new e2e deployment: `npx convex deployment create dev/e2e --type dev`.
  Leave out `--select` so `.env.local` stays on your dev deployment.

## Running

```sh
pnpm test:e2e                                   # full run, about 4 minutes
pnpm test:e2e e2e/journeys/training.e2e.ts      # one file (still reseeds)
E2E_REUSE_SEED=1 pnpm test:e2e <file>           # skip the reseed while writing a test
pnpm exec playwright show-report e2e/.report    # traces and screenshots of failures
```

`E2E_REUSE_SEED=1` keeps whatever earlier runs changed, so a test that
completes, skips or removes something will fail the second time. Reseed
before trusting a result.

## Writing a journey

- Use `test` and `as(key)` from `e2e/support/fixtures.ts` to open a page as
  any seeded person. Ids live in `seed`.
- Find things by role and label (`getByRole`, `getByLabel`) using the English
  copy. Horse cards hide their checkbox, so use `pickHorse`.
- A journey that changes shared data gets its own seeded rows, so files can run
  in parallel. Riverside Yard is the stable people join, leave and get removed
  from, so Hilltop's roster never changes during a run.
- A known bug stays as a `test.fail(true, 'Known bug: …')` test. When the fix
  lands, Playwright reports an unexpected pass; then remove the marker.
- `runInternal('e2e:latestEmailToken', { recipient })` stands in for opening the
  invitation email.
- States the app can't reach on demand come from `convex/e2e.ts` too:
  `seedPastSkips` (a skip made before its date passed) and `holdMove` (a horse
  frozen mid-move; release it with `hold: false` in a `finally`).
