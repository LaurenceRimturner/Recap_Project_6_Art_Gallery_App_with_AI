# Plan: Issue 5 - Spotlight Page

## Summary

The homepage `/` shows one randomly chosen art piece as a spotlight: its image and the artist's name. The piece is picked once (not on every re-render) from the data already fetched in `App.tsx` via `useSWR`.

## Findings

- `src/App.tsx` fetches with `useSWR` and has `renderArtPieces()` (loading/error/list) used only for `/art-pieces`. `/` has no route yet.
- `ArtPiece` type is `{ slug, artist, name, imageSource }`. `ArtPiecePreview` renders `img` (alt = name) + caption `"name" by artist`.
- Existing `App.test.tsx` has a test on `/` that assumes nothing loads there (`keeps the heading and shows no loading message on other routes`). It conflicts with this issue; see Decisions.
- Hint: picking in the component body re-randomises on every render. Pick once with `useState(() => ...)` inside a component that only mounts once data exists.

## Tests per acceptance criterion

| Criterion                       | Test (file: name)                                                          | Asserts                                                                                                                                 |
| ------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| One art piece randomly selected | `src/pickRandom.test.ts`: returns an element of the array                  | with `crypto.getRandomValues` stubbed to 0, 0.5, 0.999, and the maximum value (2^32-1), the result is the first / middle / last element |
| (same, helper edge)             | `pickRandom.test.ts`: returns undefined for an empty array                 | `pickRandom([])` is `undefined`                                                                                                         |
| (same, picked once)             | `src/components/Spotlight.test.tsx`: keeps the same piece on re-render     | after `rerender` with `crypto.getRandomValues` changed, the shown piece is unchanged                                                    |
| Image displayed                 | `Spotlight.test.tsx`: shows the image                                      | `getByRole("img", { name: <name> })` has `src` = `imageSource` (single-piece array)                                                     |
| Artist's name displayed         | `Spotlight.test.tsx`: shows the artist's name                              | the artist text is in the document                                                                                                      |
| Available on `/`                | `src/App.test.tsx`: shows the spotlight on /                               | with `MemoryRouter initialEntries={["/"]}` and mocked `fetch`, the image and artist appear                                              |
| Loading / error on `/`          | `App.test.tsx`: shows a loading message on / ; shows an error message on / | "Loading..." before data; "Failed to load art pieces." on a failing fetch                                                               |

SWR tests keep the fresh-cache `SWRConfig` wrapper.

## Files that change

- `src/pickRandom.ts` (new): `pickRandom<T>(items: T[]): T | undefined` using `crypto.getRandomValues` (lint rule `sonarjs/pseudo-random` forbids `Math.random`).
- `src/components/Spotlight.tsx` (new): props `{ pieces: ArtPiece[] }`; picks once via `useState(() => pickRandom(pieces))`; renders `<figure className="art-piece spotlight">` with `img` (alt = name) and `<figcaption>"name" by artist</figcaption>`; renders nothing for an empty array.
- `src/App.tsx` (modify): extract the loading/error handling into a shared helper used by both routes; add `<Route path="/" ...>` rendering `<Spotlight pieces={data} />`.
- Test files next to each of the above; update `src/App.test.tsx`.
- `src/styles.css`: no change. `.art-piece` and `.spotlight img` already exist (`.spotlight img` is declared later, so it overrides the image height).

## Out of scope

Navigation bar/links, favorite buttons, details page, gallery page changes (no classNames on `ArtPieces`/`ArtPiecePreview`), persistence, a "new random piece" button, a 404 route.

## Decisions (confirmed)

1. `keeps the heading and shows no loading message on other routes` is moved to `/unknown` (its intent is kept, since `/` now loads data); new loading/error tests for `/` are added.
2. Caption shows title and artist (`"Title" by Artist`), `alt` = title.
3. New dedicated `Spotlight` component; the random pick happens inside it.
4. Loading/error handling is a shared helper in `App.tsx`.

## Verification

`npx vitest run <file>` per new test file (red first, then green), then `npm run check`, `lint`, `format:check`, `test:run`, `build`; load `/` in `npm run dev` and refresh to see a different spotlight.
