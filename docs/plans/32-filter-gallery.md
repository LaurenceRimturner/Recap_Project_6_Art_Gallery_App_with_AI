# Plan: Issue #32 – Filter the Gallery by Search, Color and Genre

## Summary

Add a `Gallery` wrapper used only by the `/art-pieces` route. It holds search, color-family and genre filters in local `useState` (so they reset on unmount), renders a search bar, color mood board, genre select and "Clear filters" button, and passes the filtered pieces to the existing `ArtPieces`. Empty result shows "No art pieces found."

## Test per acceptance criterion

Pure helpers get `.test.ts` files; UI gets component tests; navigation/integration goes in `src/App.test.tsx`.

| #   | Acceptance criterion                                  | Test (file – name)                                                                                                                                                             | Asserts                                                                       |
| --- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 1   | Search filters by name or artist, case-insensitive    | `src/filterPieces.test.ts` – "matches name case-insensitively", "matches artist"; `src/components/Gallery.test.tsx` – "filters by typed search text"                           | Typing "mona" keeps only matching pieces                                      |
| 2   | Mood board groups colors into families                | `src/colorFamily.test.ts` – "maps hex to family", "groups similar hues together"; `src/components/ColorMoodBoard.test.tsx` – "renders one selectable group per family present" | Reds land in one family; one button per family with swatches                  |
| 3   | Selecting a family filters; selecting again deselects | `ColorMoodBoard.test.tsx` – "toggles aria-pressed"; `Gallery.test.tsx` – "shows only pieces with a color in the selected family", "deselecting restores all"                   | Only pieces with ≥1 color in family; toggling off restores list               |
| 4   | Genre selector lists all genres + "all genres"        | `Gallery.test.tsx` – "lists every genre once plus all genres"                                                                                                                  | Options = sorted unique genres + "All genres"                                 |
| 5   | Choosing a genre filters                              | `Gallery.test.tsx` – "filters by genre"                                                                                                                                        | Only that genre's pieces shown                                                |
| 6   | Filters combine (AND)                                 | `filterPieces.test.ts` – "requires all active filters"; `Gallery.test.tsx` – "combines search, color and genre"                                                                | Piece must satisfy all                                                        |
| 7   | "Clear filters" resets all; disabled when none active | `Gallery.test.tsx` – "clear button disabled without filters", "clear resets search, color and genre"                                                                           | Disabled initially; after click inputs reset and full list shown              |
| 8   | Filters reset on leaving the gallery                  | `App.test.tsx` – "resets filters after navigating away and back"                                                                                                               | Type search → click Spotlight → click Gallery → input empty, all pieces shown |
| 9   | Empty-state message                                   | `Gallery.test.tsx` – "shows no art pieces found when nothing matches"                                                                                                          | Message shown; list empty                                                     |
| 10  | Filters only on gallery page                          | `App.test.tsx` – "no filters on /favorites and /"                                                                                                                              | No search box / genre select / clear button there                             |

## Files that change

- **Create** `src/colorFamily.ts` (+ `.test.ts`) – hex → color family (see Decisions: red, yellow, green, blue, purple, pink, neutral, grey).
- **Create** `src/filterPieces.ts` (+ `.test.ts`) – pure `filterPieces(pieces, {search, family, genre})`; flat in `src/` like `pickRandom.ts`.
- **Create** `src/components/ColorMoodBoard.tsx` (+ test) – family buttons with swatches (`aria-pressed`), reusing `.swatch` look from `ColorPalette`.
- **Create** `src/components/Gallery.tsx` (+ test) – owns filter state, search input, genre `select`, clear button, empty state; renders `ArtPieces`.
- **Modify** `src/App.tsx` (`/art-pieces` route, ~lines 122-131) – render `Gallery` instead of `ArtPieces`; `/favorites` unchanged.
- **Modify** `src/styles.css` – filter bar, mood board, select styles using existing tokens and Swiss grid; reuse `input[type="text"]` and `.comment-form button` button styling.
- **Modify** `src/App.test.tsx` – criteria 8 and 10 (follow `renderApp` + fetch-stub pattern).

## Out of scope

- Persisting filters (URL params / localStorage); filters on Favorites or Spotlight.
- Sorting, pagination, API changes, new dependencies.
- Re-running the GSAP reveal animation on filter change (existing `useReveal` stays as is).

## Decisions (confirmed with user)

1. **Issue number**: #32 (`14` was a merged PR). Branch `feature/32-filter-gallery`, file `docs/plans/32-filter-gallery.md`.
2. **Color selection**: single-select (changed from multi-select after review of the behavior); only one family active at a time, a piece matches if it has a color in that family.
3. **Families** (revised during implementation): the mood board shows six groups – neutral, yellow, green, blue, purple, pink – and only those present in the data, each with at most 6 swatches. `neutral` holds muted beige-ish orange/yellow hues (20–70°, saturation < 0.5); saturated oranges count as yellow. Reds and greys (an internal hidden `grey` bucket, also used for unparsable hex values) get no group and cannot be selected.

## Open questions

None.

## Verification

- `npx vitest run` on each new test file, then `npm run test:run`.
- `npm run check`, `npm run lint`, `npm run format:check`, `npm run build`.
- Manual: `npm run dev` (port 3000) → /art-pieces: search, pick colors, pick genre, clear, navigate away and back.

## After approval (plan-feature phase 2)

Create branch `feature/<n>-<slug>`, save this plan as `docs/plans/<n>-<slug>.md`, commit only that file, stop (next step: `tdd-feature`).
