# Plan: #39 Add, Edit and Delete Your Own Art Pieces

## Summary

A "Add art piece" button in the navigation opens a modal form (image URL, name, artist, genre, year, all required). Own pieces are stored in `localStorage` under their own key, merged with the API pieces in `App.tsx`, and show up everywhere (gallery, filters, favorites, comments, detail page). On the detail page, own pieces get Edit (same modal, prefilled) and Delete (with confirmation, also removes favorite and comments).

## Test per acceptance criterion

| Criterion                                          | Test (file, name)                                                                                                                   | Asserts                                                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Nav has "Add art piece", opens modal               | `Navigation.test.tsx` "shows an Add art piece button" / "calls onAddClick when clicked"                                             | A `button` (not a link) in the nav; click calls the handler                                                                         |
| Nav still has exactly three links                  | existing `Navigation.test.tsx` test (unchanged)                                                                                     | Button is not counted as a link                                                                                                     |
| Modal opens                                        | `App.test.tsx` "opens the add modal from the navigation"                                                                            | `dialog` with heading appears after click                                                                                           |
| Fields with labels                                 | `ArtPieceModal.test.tsx` "shows labelled fields for image URL, name, artist, genre and year"                                        | `getByLabelText` for all five                                                                                                       |
| All fields required, message names the field       | `ArtPieceModal.test.tsx` "shows an error for each empty field" / "rejects whitespace-only values"                                   | `onSave` not called; alert text names the missing field                                                                             |
| Image URL must be valid http(s)                    | `ArtPieceModal.test.tsx` "rejects an invalid image URL" / "accepts http and https URLs"                                             | `not-a-url`, `ftp://x` rejected with message; valid ones accepted                                                                   |
| Valid submit saves, closes, clears                 | `ArtPieceModal.test.tsx` "calls onSave with trimmed values" ; `App.test.tsx` "adds a piece and closes the modal"                    | `onSave` gets trimmed values; dialog gone; reopening shows empty fields                                                             |
| Close without saving (button, Escape)              | `ArtPieceModal.test.tsx` "closes with the Close button" / "closes on Escape"; `App.test.tsx` "saves nothing when closed"            | `onClose` called, `onSave` not; localStorage unchanged                                                                              |
| Appears in gallery + own detail page               | `App.test.tsx` "shows an added piece in the gallery and on its detail page"                                                         | Piece image/caption in gallery; link leads to detail page with name, artist, year, genre                                            |
| Works with search, genre, favorites, comments      | `App.test.tsx` "finds an added piece by search and genre" / "favorites and comments an added piece"                                 | Filters match it; favorite shows in `/favorites`; comment can be added                                                              |
| No palette for own pieces                          | `ColorPalette.test.tsx` "renders nothing without colors"; `ArtPieceDetails.test.tsx` "hides the Colors heading"                     | No "Colors" heading for `colors: []`                                                                                                |
| Persisted across reload                            | `App.test.tsx` "restores own pieces from localStorage" / "saves an added piece" / "ignores invalid stored data"                     | Seeded storage shows piece; add writes JSON; `"{oops"` / non-array does not crash                                                   |
| Edit/Delete only on own pieces                     | `ArtPieceDetails.test.tsx` "shows Edit and Delete only when handlers are given"; `App.test.tsx` "API pieces have no Edit or Delete" | Buttons absent for API piece                                                                                                        |
| Edit opens prefilled modal, same validation, saves | `ArtPieceModal.test.tsx` "prefills fields when editing"; `App.test.tsx` "edits an own piece"                                        | Values prefilled; invalid edit rejected; saved change visible in detail, gallery and localStorage; slug/favorites/comments kept     |
| Delete with confirmation                           | `ArtPieceDetails.test.tsx` "asks for confirmation before deleting"; `App.test.tsx` "deletes an own piece"                           | Cancel keeps it; confirm removes piece from gallery + localStorage, removes its favorite/comments entry, navigates to `/art-pieces` |

## Files that change

- `src/types.ts`: no new shape needed; own pieces are `ArtPiece` with `colors: []`.
- `src/components/ArtPieceModal.tsx` (new): `<dialog>` form. Props: `piece?` (prefill when editing), `onSave(values)`, `onClose()`. `noValidate` form with own per-field error messages (`role="alert"`); trims values; URL check via `new URL()` + http/https. jsdom 25 has no `showModal`, so call `showModal()` when it exists, otherwise set `open`; handle Escape in `onKeyDown` plus `onCancel`.
- `src/components/Navigation.tsx`: accept `onAddClick`; render an "Add art piece" `<button>` after the links (button, so the "exactly three links" test stays valid).
- `src/components/ArtPieceDetails.tsx`: optional `onEdit` / `onDelete`; when given show Edit and Delete (inline confirm, like comments).
- `src/components/ColorPalette.tsx`: return `null` when `colors` is empty.
- `src/App.tsx`: `loadOwnPieces()` (try/catch + `Array.isArray`, like `loadArtPiecesInfo`), state + `useEffect` writing under `"own-art-pieces"`; `addPiece` (slug `own-<kebab-name>-<timestamp>`), `editPiece`, `deletePiece` (also drops the slug from `artPiecesInfo`); merge `[...ownPieces, ...data]` in `renderWithPieces`; modal open/edit state; `ArtPieceRoute` passes `onEdit`/`onDelete` only for own slugs and navigates to `/art-pieces` after delete.
- `src/styles.css`: nav button styled like nav links (rail + mobile bar), modal/form/backdrop in the Swiss grid style, field error text.
- Tests: new `ArtPieceModal.test.tsx`; additions to `Navigation.test.tsx`, `ColorPalette.test.tsx`, `ArtPieceDetails.test.tsx`, `App.test.tsx`. Existing tests are not modified (new props optional where possible).

## Out of scope

- Image upload / file picker, color input for own pieces, palette editing.
- Checking that the image URL actually loads; year format validation beyond "required".
- Editing or deleting API pieces; syncing own pieces across tabs or a backend.
- Showing own pieces while the API is loading or failed (they are merged only once the API data is available, like the other routes).

## Open questions (defaults assumed, tell me to change)

1. Year is free text, required only (no numeric check). Default: yes.
2. Own pieces are listed first in the gallery. Default: yes.
3. Edit keeps the slug (so favorites/comments stay linked). Default: yes.
4. Own pieces appear only once the API has loaded (see out of scope). Default: yes.

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`; manual check in `npm run dev`: add, reload, edit, delete, nav button on desktop rail and mobile bar.
