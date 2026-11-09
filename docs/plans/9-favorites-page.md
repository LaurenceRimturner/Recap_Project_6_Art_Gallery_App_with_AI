# Plan: Issue 9 - Favorites Page

## Summary

Add a "Favorites" nav link and a `/favorites` route that lists only the favorite art pieces, reusing the existing `ArtPieces` list (image, title, artist, active favorite button).

## Findings

- `App.tsx` already holds `artPiecesInfo` (`{ slug, isFavorite }[]`) with `isFavorite(slug)` and `toggleFavorite(slug)`, and fetches all pieces via SWR.
- Routes use `renderWithPieces((pieces) => <X pieces isFavorite onToggleFavorite />)`, which handles loading and error states.
- `ArtPieces` renders `ArtPiecePreview` per piece, which includes the image, a "title by artist" caption and `FavoriteButton`. Passing `isFavorite` makes the button active.
- `Navigation.tsx` builds links from a `links` array; `NavLink` sets the `active` class.
- `src/styles.css` already styles `.art-list` and the nav; no new CSS is needed.

## Tests per acceptance criterion

| Criterion                               | Test (file: name)                                                  | Asserts                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| Nav link labeled "Favorites"            | `Navigation.test.tsx`: shows a Favorites link                      | link "Favorites" has `href="/favorites"`                                                     |
| Nav link highlights on its route        | `Navigation.test.tsx`: highlights the Favorites link on /favorites | link has class `active`                                                                      |
| Clicking "Favorites" shows `/favorites` | `App.test.tsx`: shows the favorites page after clicking Favorites  | click link, page content for favorites is shown                                              |
| Only favorites are listed               | `App.test.tsx`: lists only favorite art pieces on /favorites       | favorite one piece in the gallery, navigate to Favorites, only that piece's image is present |
| Image, title and artist shown           | `App.test.tsx`: shows image, title and artist of favorites         | image by name and caption with title and artist are present                                  |
| Active favorite button                  | `App.test.tsx`: shows an active favorite button for each favorite  | button "Remove from favorites" with `aria-pressed="true"`                                    |

## Files that change

- `src/components/Navigation.tsx`: add `{ to: "/favorites", label: "Favorites", end: false }` to `links`.
- `src/App.tsx`: add a `/favorites` route before `*`, rendering `ArtPieces` with `pieces.filter((p) => isFavorite(p.slug))`.
- `src/components/Navigation.test.tsx` and `src/App.test.tsx`: the tests above.
- `docs/plans/9-favorites-page.md`: this plan (created after approval).

## Out of scope

- Persisting favorites (localStorage or backend).
- Any new component, new state or CSS changes.
- Changes to the gallery, spotlight or details pages.

## Open questions

- None. Decided with the user: no empty-state message (`/favorites` with no favorites renders an empty list), and the nav active-highlight test is included.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`. Manually: favorite a piece in the gallery, open Favorites, see it listed with an active button; un-favorite it and see it disappear.
