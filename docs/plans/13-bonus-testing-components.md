# Plan: #13 Bonus - Testing Components

## Summary

Automate component tests for Spotlight, art piece preview/list, Navigation and art piece details. Most of these already have test files (98 tests pass), so this issue closes the remaining gaps per component. Test-only: no application code changes.

## Test per acceptance criterion

Criterion: "Automated tests cover the core components, ensuring they render and function as expected."

| Task           | Existing coverage                                                          | New test (file: name)                                             | Asserts                                                             |
| -------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| Spotlight      | image, artist, link, stable pick, empty, button present                    | `Spotlight.test.tsx`: shows the title                             | figcaption contains `"Orange Red and Green"`                        |
|                |                                                                            | `Spotlight.test.tsx`: shows a favorite as pressed                 | `isFavorite` true -> "Remove from favorites", `aria-pressed="true"` |
|                |                                                                            | `Spotlight.test.tsx`: toggles favorite with the piece slug        | click calls `onToggleFavorite("orange-red-and-green")` once         |
| Preview + list | Preview: complete. List: item count, button count                          | `ArtPieces.test.tsx`: shows image, title and artist of each piece | one img/caption per piece                                           |
|                |                                                                            | `ArtPieces.test.tsx`: links each piece to its details page        | hrefs `/art-pieces/<slug>`                                          |
|                |                                                                            | `ArtPieces.test.tsx`: marks only favorite pieces as pressed       | `isFavorite` per slug -> one pressed button                         |
|                |                                                                            | `ArtPieces.test.tsx`: toggles the clicked piece                   | click calls `onToggleFavorite` with that slug                       |
|                |                                                                            | `ArtPieces.test.tsx`: renders an empty list for no pieces         | no listitems                                                        |
| Navigation     | 3 links + active states                                                    | `Navigation.test.tsx`: renders exactly three links inside a nav   | `navigation` role, 3 links                                          |
| Details        | image, title, artist, year, genre, palette, back, favorite, comments, form | none needed                                                       | already complete                                                    |

## Files that change

- `src/components/Spotlight.test.tsx`: add 3 tests
- `src/components/ArtPieces.test.tsx`: add 5 tests
- `src/components/Navigation.test.tsx`: add 1 test

## Out of scope

- Application code changes, new components, App-level tests
- Changing existing tests or coverage thresholds
- Details tests (already complete)

## Decisions (resolved)

- Branch `feature/13-bonus-testing-components` is created from `main`, so the PR holds only #13. The user deals with the uncommitted/#12 changes first (they block `git switch`, or stay untouched if unrelated).
- Add all 9 gap-filling tests, even though some pass immediately (characterization tests).

## Verification

`npm run check`, `lint`, `format:check`, `test:run`, `build`.
