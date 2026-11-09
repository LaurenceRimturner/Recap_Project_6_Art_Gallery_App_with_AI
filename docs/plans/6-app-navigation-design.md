# Plan: Issue 6 - App Navigation Design

## Summary

A `Navigation` component with "Spotlight" (`/`) and "Gallery" (`/art-pieces`) links is rendered once in `App`, so it shows on every page. It is a fixed vertical bar on the right edge. The current page's link is highlighted via `NavLink`'s `active` class, and unknown URLs show "Page not found".

## Findings

- `src/App.tsx` has `<main><h1>Art Gallery</h1><Routes>` with `/` (Spotlight) and `/art-pieces` (gallery). `BrowserRouter` is in `src/index.tsx`; tests use `MemoryRouter`.
- `src/styles.css` already styles `nav` as a fixed bottom bar (`position: fixed; right/bottom/left: 0; display: flex; justify-content: center`), `nav a`, `nav a.active`; `main` has `padding-bottom: 5rem` for the bar. The chosen position (right edge) needs CSS changes.
- `@testing-library/user-event` is installed (clicks). `react-router` ^8.5 exports `NavLink`.
- Hint from the issue: use `NavLink`, with `end` on the link to `/`.

## Tests per acceptance criterion

| Criterion                                  | Test (file: name)                                                                                 | Asserts                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| "Spotlight" link displayed                 | `src/components/Navigation.test.tsx`: shows a Spotlight link                                      | `getByRole("link", { name: "Spotlight" })` has `href="/"`                                                                |
| "Gallery" link displayed                   | `Navigation.test.tsx`: shows a Gallery link                                                       | `getByRole("link", { name: "Gallery" })` has `href="/art-pieces"`                                                        |
| Current page link highlighted              | `Navigation.test.tsx`: highlights the Spotlight link on /                                         | at `/`, Spotlight has class `active`, Gallery does not (covers `end`)                                                    |
| (same)                                     | `Navigation.test.tsx`: highlights the Gallery link on /art-pieces                                 | at `/art-pieces`, Gallery has class `active`, Spotlight does not                                                         |
| Clicking "Spotlight" shows Spotlight page  | `src/App.test.tsx`: shows the spotlight after clicking Spotlight                                  | start at `/art-pieces`, click the link, the spotlight image for a single-piece mocked fetch appears and the list is gone |
| Clicking "Gallery" shows Gallery page      | `App.test.tsx`: shows the gallery after clicking Gallery                                          | start at `/`, click the link, the list (`getByRole("list")`) appears                                                     |
| Unknown URLs show "Page not found"         | `App.test.tsx`: shows Page not found on unknown URLs                                              | at `/unknown`, "Page not found" is displayed                                                                             |
| Task: render Navigation once, on all pages | `App.test.tsx`: shows the navigation once on %s (`test.each` over `/`, `/art-pieces`, `/unknown`) | on `/`, `/art-pieces` and `/unknown`, `getAllByRole("navigation")` has length 1                                          |

Navigation tests wrap the component in `MemoryRouter`; App tests keep the fresh-cache `SWRConfig` wrapper. The right-edge position is CSS only and is not covered by a test (jsdom does not compute layout); it is checked manually.

## Files that change

- `src/components/Navigation.tsx` (new): `<nav>` mapping a links array to `NavLink`s: `/` with `end` ("Spotlight") and `/art-pieces` ("Gallery").
- `src/App.tsx` (modify): render `<Navigation />` once after `<main>` (wrap in a fragment); add inline `<Route path="*" element={<p>Page not found</p>} />`.
- `src/components/Navigation.test.tsx` (new), `src/App.test.tsx` (add tests; existing tests stay unchanged).
- `src/styles.css` (modify, requested): `nav` becomes a fixed vertical bar on the right edge (`top: 0; right: 0; bottom: 0; left: auto; flex-direction: column; justify-content: center`), and `main`'s bottom padding is replaced by right padding so content is not covered. Both use one `--nav-width` CSS variable (8rem) so they stay in sync.

## Future pages

The details page and a favorites page do not exist yet and will be added in later issues. This issue prepares for them without building them:

- `Navigation` keeps its links in a small array (`{ to, label, end? }`) mapped to `NavLink`s, so a later issue adds a "Favorites" entry with one line (and its own test).
- The vertical right-edge bar already fits more links.
- The details page is reached from the gallery, not the nav, so it gets no link. Its route will sit before the `*` catch-all.
- No "Favorites" link now: it would point at a missing page and land on "Page not found".

## Out of scope

Favorite buttons, the details and favorites pages and their routes or nav links, a separate NotFound component or link home, icons, mobile menu, changing the `<h1>`.

## Decisions (confirmed)

1. `<Navigation />` is rendered once after `<main>`, as a fixed vertical bar on the right edge (CSS change approved).
2. "Page not found" is an inline `<p>` route; the navigation stays visible.
3. `<h1>Art Gallery</h1>` stays unchanged.

## Verification

`npx vitest run <file>` per new test (red first, then green), then `npm run check`, `lint`, `format:check`, `test:run`, `build`; in `npm run dev` click both links, check the highlight and the right-edge bar (content not hidden behind it), and open an unknown URL.
