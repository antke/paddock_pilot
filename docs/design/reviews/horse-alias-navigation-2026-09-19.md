# Horse alias navigation — installed-router regression

19 September2026. Bounded correction to the horse index and legacy health aliases. No browser navigation, authenticated query or backend operation was performed by this test pass.

## Confirmed defect and correction

Both aliases used Navigate without replacement. Back revisited the alias entry and immediately navigated forward again, preventing return to the preceding page. Both tests failed before correction at the assertion that Previous page becomes visible after Back; `/tmp/paddock-horse-alias-before.log` records two failures.

Both existing route components now pass `replace`, preserving the stable and horse IDs and destinations:

- `src/routes/stables/_layout/$stableId/horses/$horseId/index.tsx` → horse profile.
- `src/routes/stables/_layout/$stableId/horses/$horseId/health.tsx` → horse care.

The change does not alter authentication, destination semantics or data policy.

## Actual harness boundary

`src/components/layout/HorseAliasNavigation.test.tsx` mounts each **actual `Route.options.component`** using installed TanStack Navigate/router and memory history. Only the file-route `useParams` lookup is supplied locally. The previous/destination pages are lightweight headings; they do not simulate authenticated horse data.

Both tests now pass: destination receives the same stable/horse IDs, Back escapes to the prior page, Forward returns to the correct destination, and history remains two entries. This is installed-router lifecycle evidence, not merely a string assertion or a mocked Navigate call. It is also not native-browser Back/Forward evidence for these aliases.

## Checks and scope

- Two tests/one file pass: `/tmp/paddock-horse-alias-tests.log`.
- Agent TypeScript, scoped lint and formatting logs: `/tmp/paddock-horse-alias-types.log`, `/tmp/paddock-horse-alias-lint.log`, `/tmp/paddock-horse-alias-format.log`.
- No new non-test TSX owner or route source is introduced; inventory counts stay unchanged.

R34/R35 receive this source/regression evidence. Their real authenticated destinations remain unverified. The prior actual lab-index browser history checks are distinct evidence and are not copied to the horse aliases. No whole-project completion or later tabs/toast correction validation follows from these tests.
