# Plan: Issue 11 - Show Color Palette

## Summary

Show the colors of an art piece on its details page as a list of square swatches, each with its hex code. The API already returns `colors: string[]` for every art piece (see README); the app does not use it yet.

## Findings

- `src/types.ts`: `ArtPiece` has no `colors` field.
- `src/components/ArtPieceDetails.tsx`: renders image, favorite button, title, artist/year/genre, then `Comments` and `CommentForm`.
- `src/styles.css` has no palette styles; `.details` children use the 12-column grid (`grid-column: 9 / -1` for `p`/`h2`). Needs a small addition.
- `ArtPiece` fixtures with no `colors` exist in `App.test.tsx`, `fetcher.test.ts`, `Spotlight.test.tsx`, `ArtPieces.test.tsx`, `ArtPiecePreview.test.tsx`, `ArtPieceDetails.test.tsx`.
- Test conventions: Vitest globals, flat `test(...)`, queries by role/name, `.tsx` tests next to components.

## Tests per acceptance criterion

| Criterion                                  | Test (file: name)                                     | Asserts                                                                          |
| ------------------------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------------- |
| Details page lists all colors of the image | `ColorPalette.test.tsx`: shows a list item per color  | list has one item per color; each hex text is shown                              |
| Details page lists all colors of the image | `ArtPieceDetails.test.tsx`: shows the color palette   | palette (heading "Colors" and the piece's hex codes) appears on the details page |
| Details page lists all colors of the image | `App.test.tsx`: shows the colors on /art-pieces/:slug | hex codes of the fetched piece are visible                                       |
| Colors displayed visually                  | `ColorPalette.test.tsx`: shows each color as a swatch | each swatch element has its color as `background-color` (inline style)           |

## Files that change

- `src/types.ts`: add `colors: string[]` to `ArtPiece`.
- `src/components/ColorPalette.tsx` (+ `ColorPalette.test.tsx`): heading "Colors" and `<ul className="palette">`; each `<li>` has a square swatch (`<span className="swatch" style={{ backgroundColor }}>`, aria-hidden) and the hex text.
- `src/components/ArtPieceDetails.tsx` (+ test): render `ColorPalette` after the genre and before `Comments`.
- `src/styles.css`: `.palette` and `.swatch` styles (square swatch, flex row, uses existing variables).
- Existing test fixtures (`App.test.tsx`, `fetcher.test.ts`, `Spotlight.test.tsx`, `ArtPieces.test.tsx`, `ArtPiecePreview.test.tsx`, `ArtPieceDetails.test.tsx`): add a `colors` field to the `ArtPiece` fixtures so `npm run check` passes. Fixture data only, no assertion changes; called out in the PR.
- `docs/plans/11-show-color-palette.md`: this plan (created after approval).

## Out of scope

- Palette on gallery, spotlight or favorites; copy-to-clipboard; extracting colors from the image; persistence.

## Open questions

None. Decided with the user: `colors` is a required `string[]`; square swatch plus hex text; placed after Genre and before Comments.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`; then `npm run dev`, open a details page and confirm the swatches and hex codes render and fit the layout.
