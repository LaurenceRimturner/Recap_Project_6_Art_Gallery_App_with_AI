# Plan: #12 Persist Favorites and Comments in the Browser

## Summary
Persist `artPiecesInfo` (favorites + comments) in `localStorage` so it survives reloads. Read once as lazy `useState` initializer; write in a `useEffect` on change. Missing, invalid or non-array stored data falls back to `[]`.

## Test per acceptance criterion
| Criterion | Test (file, name) | Asserts |
|---|---|---|
| Favorites persist across reloads | `src/App.test.tsx` "restores favorites from localStorage on load" | Seed `localStorage` with `[{slug:"wheat-field",isFavorite:true,comments:[]}]`, render `/art-pieces`: wheat-field shows "Remove from favorites", the other "Add to favorites" |
| Favorites persist across reloads | `src/App.test.tsx` "saves a favorite to localStorage" | Click favorite, parse stored JSON: contains `{slug, isFavorite:true}` |
| Comments persist across reloads | `src/App.test.tsx` "restores comments from localStorage on load" | Seed with a comment, render `/art-pieces/wheat-field`: comment text visible |
| Comments persist across reloads | `src/App.test.tsx` "saves a comment to localStorage" | Add comment, stored JSON contains it |
| Full reload round trip | `src/App.test.tsx` "keeps favorite and comment after remounting the app" | Favorite + comment, unmount, render again: both still shown |
| App works without stored data | `src/App.test.tsx` "works with empty localStorage" | Empty storage: gallery renders, all buttons "Add to favorites" |
| App works without stored data (robustness) | `src/App.test.tsx` "ignores invalid JSON in localStorage" and "ignores non-array data" | Seed `"{oops"` / `"{}"`: app renders with no favorites/comments, no crash |

## Files that change
- `src/App.tsx`: add `loadArtPiecesInfo()` (try/catch around `JSON.parse`, `Array.isArray` check, return `[]` otherwise), use `useState<ArtPieceInfo[]>(loadArtPiecesInfo)`, add `useEffect` writing `JSON.stringify` under one key constant (`"art-pieces-info"`).
- `src/App.test.tsx`: new tests above.
- `src/setupTests.ts`: add `afterEach(() => localStorage.clear())` so persisted state does not leak between the existing tests (existing tests are not modified).

## Out of scope
- Persisting the art pieces themselves (always fetched via SWR).
- A custom `useLocalStorage` hook, cross-tab sync (`storage` event), schema validation/migration of stored items, quota error handling on write.

## Open questions
None. Decisions (confirmed by user): `setupTests.ts` global `localStorage.clear()` cleanup is OK; array check only for validation; write errors out of scope.

## Verification
`npm run check`, `lint`, `format:check`, `test:run`, `build`.
