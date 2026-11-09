# Plan: Issue 8 - Mark Art Pieces as Favorites

## Summary

A reusable `FavoriteButton` (heart) appears on every gallery entry, on the Spotlight piece and on the details page. Favorite status lives in `App` state (`ArtPieceInfo[]`, keyed by `slug`), is passed down via props, and toggles on click with a visual indication.

## Findings

- `src/App.tsx` owns the `Routes`, the SWR fetch and `renderWithPieces`; `ArtPieceRoute` handles the details route. This is where the shared state goes (per the issue hint).
- `ArtPiecePreview` and `Spotlight` wrap the whole `<figure>` in a `<Link>` to the details page. A button inside the link would also trigger navigation, so the button must sit **outside** the `<Link>` (sibling of it).
- `.art-piece` is already `position: relative`, and `styles.css` already has `.favorite-button` (absolute, top-right) and `.favorite-button[aria-pressed="true"]` (pink). Styling is mostly done. `.details` is not `position: relative`.
- `lucide-react` is not installed; the issue only says "you can find a heart icon on Lucide".
- Tests: Vitest globals, `MemoryRouter` + fresh `SWRConfig` in `App.test.tsx`, `userEvent` for clicks.

## Tests per acceptance criterion

| Criterion                              | Test (file: name)                                                                       | Asserts                                                                                                                         |
| -------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Button on each list entry              | `ArtPieces.test.tsx`: shows a favorite button for each piece                            | `getAllByRole("button", { name: /favorite/i })` length equals number of pieces                                                  |
| Button on details view                 | `ArtPieceDetails.test.tsx`: shows a favorite button                                     | `getByRole("button", { name: /favorite/i })` present                                                                            |
| Button on spotlight view               | `Spotlight.test.tsx`: shows a favorite button                                           | `getByRole("button", { name: /favorite/i })` present                                                                            |
| Click non-favorite saves + indicates   | `FavoriteButton.test.tsx`: calls onToggle on click                                      | click calls `onToggle` once                                                                                                     |
|                                        | `App.test.tsx`: marks a piece as favorite from the gallery                              | click, the button gets `aria-pressed="true"` and its label changes (e.g. "Remove from favorites")                               |
| Click favorite removes + indicates     | `App.test.tsx`: removes a piece from favorites                                          | click twice, `aria-pressed="false"` again                                                                                       |
| Favorites highlighted                  | `FavoriteButton.test.tsx`: reflects isFavorite via aria-pressed and label               | `isFavorite` true gives `aria-pressed="true"`, false gives `"false"`                                                            |
| State shared across pages              | `App.test.tsx`: keeps the favorite status between gallery and details                   | favorite in gallery, navigate to details via link, button is pressed there; toggle off there, back in gallery it is not pressed |
| Click does not navigate                | `ArtPiecePreview.test.tsx`: clicking the favorite button does not open the details page | after click the link/list is still shown, no details heading                                                                    |
| Favorite status is per piece (by slug) | `App.test.tsx`: favoriting one piece leaves the others unchanged                        | only the clicked piece's button is pressed                                                                                      |

Existing tests stay unchanged except for added props in fixtures/renders (components gain `favorites`/`onToggleFavorite` props); called out in the PR.

## Files that change

- `package.json` / lockfile: add `lucide-react`.
- `src/types.ts`: add `ArtPieceInfo = { slug: string; isFavorite: boolean }`.
- `src/components/FavoriteButton.tsx` (new) + `FavoriteButton.test.tsx` (new): `<button type="button" className="favorite-button" aria-pressed={isFavorite} aria-label=...>` with a heart icon; filled when favorite. Props: `isFavorite`, `onToggle`. Heart icon from `lucide-react` (new dependency, `npm install lucide-react`; user decision), filled when favorite.
- `src/App.tsx`: `useState<ArtPieceInfo[]>([])`; helpers `isFavorite(slug)` and `toggleFavorite(slug)` (add/flip entry by slug). Pass `isFavorite` / `onToggleFavorite` to `Spotlight`, `ArtPieces`, `ArtPieceRoute`.
- `src/components/ArtPieces.tsx`, `ArtPiecePreview.tsx`: accept the props; render `FavoriteButton` as a sibling of the `<Link>` inside the `li.art-piece`.
- `src/components/Spotlight.tsx`: same, button next to the `<Link>` in a `position: relative` wrapper (`art-piece spotlight` class moves to the wrapper).
- `src/components/ArtPieceDetails.tsx`: render `FavoriteButton`.
- `src/styles.css`: make `.details` `position: relative` (or the image wrapper) so the absolute button anchors correctly; tweak only if needed.
- Matching test files: `ArtPieces`, `ArtPiecePreview`, `Spotlight`, `ArtPieceDetails`, `App`.

## Out of scope

Persisting favorites (localStorage), a favorites page/filter, changing fetched art pieces, comments, colors/theming beyond the existing `.favorite-button` rules.

## Open questions

None. Decisions confirmed by the user: `lucide-react` heart icon, `ArtPieceInfo[]` state in `App` (entries created on first toggle), button placed outside the `<Link>`.

## Verification

`npx vitest run <file>` per test (red first, then green), then `npm run check`, `lint`, `format:check`, `test:run`, `build`. In `npm run dev`: toggle hearts on gallery, spotlight and details, confirm the click does not navigate, and that status carries across pages (not across a reload).
