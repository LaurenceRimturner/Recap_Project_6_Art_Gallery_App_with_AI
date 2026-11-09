# Plan: Issue 7 - Art Piece Details Page

## Summary

Clicking an art piece in the gallery opens `/art-pieces/:slug`, which shows the piece's image, title, artist, year and genre plus a back button to `/art-pieces`. An unknown slug shows "Art piece not found".

## Findings

- `src/App.tsx` fetches all pieces with SWR and uses `renderWithPieces` (loading/error handling). Routes: `/`, `/art-pieces`, `*` ("Page not found"). The new route goes before `*`.
- `src/types.ts`: `ArtPiece` has only `slug, artist, name, imageSource`. **`year` and `genre` are missing** and must be added. The API (`https://example-apis.vercel.app/api/art`) is expected to return them (could not verify: curl was denied). Assumption to confirm.
- `ArtPiecePreview` renders `<figure>` with img and caption; `ArtPieces` renders `<li className="art-piece">` per piece. No links yet.
- `src/styles.css` already has a `.details img` rule (reuse the `details` class). The `.art-piece` class is `position: relative` (for the later favorite button).
- Tests: Vitest globals, `MemoryRouter` + fresh `SWRConfig` wrapper in `App.test.tsx`, `userEvent` for clicks.

## Tests per acceptance criterion

| Criterion                         | Test (file: name)                                                               | Asserts                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Click on a piece navigates        | `ArtPiecePreview.test.tsx`: links to the details page (wrapped in MemoryRouter) | `getByRole("link", { name: /Orange Red and Green/ })` has `href="/art-pieces/orange-red-and-green"` |
| (same, end to end)                | `App.test.tsx`: shows the details after clicking a piece in the list            | start `/art-pieces`, click the piece link, the details heading/year appear and the list is gone     |
| (Spotlight entry, confirmed)      | `Spotlight.test.tsx`: links to the details page (wrapped in MemoryRouter)       | the spotlight piece's link has `href="/art-pieces/<slug>"`                                          |
| Route `/art-pieces/:slug`         | `App.test.tsx`: shows the details on /art-pieces/:slug                          | render at `/art-pieces/wheat-field`, shows Wheat Field's details (not the other piece)              |
| Image displayed                   | `ArtPieceDetails.test.tsx`: shows the image                                     | `getByRole("img", { name: piece.name })` has `src` = `imageSource`                                  |
| Title displayed                   | `ArtPieceDetails.test.tsx`: shows the title                                     | `getByRole("heading", { name: piece.name })`                                                        |
| Artist displayed                  | `ArtPieceDetails.test.tsx`: shows the artist                                    | text contains artist name                                                                           |
| Year displayed                    | `ArtPieceDetails.test.tsx`: shows the year                                      | text contains year                                                                                  |
| Genre displayed                   | `ArtPieceDetails.test.tsx`: shows the genre                                     | text contains genre                                                                                 |
| Back button displayed             | `ArtPieceDetails.test.tsx`: shows a back link                                   | `getByRole("link", { name: "Back" })` has `href="/art-pieces"`                                      |
| Back button navigates to the list | `App.test.tsx`: goes back to the list after clicking Back                       | start `/art-pieces/wheat-field`, click Back, the list (`getByRole("list")`) appears                 |
| Unknown slug, no crash            | `App.test.tsx`: shows "Art piece not found" for an unknown slug                 | at `/art-pieces/nope`, "Art piece not found" is shown, no crash, nav still visible                  |

The details component takes a single `piece` prop (like `Spotlight`/`ArtPiecePreview`); the slug lookup and not-found message live in the route in `App.tsx`, so the lookup is covered by the `App` tests. Existing tests stay unchanged except that test data gains `year`/`genre` where the type requires it, and `ArtPiecePreview`/`ArtPieces` tests must wrap in `MemoryRouter` once they contain a `Link` (setup change only, no assertion changed; to be called out in the PR).

## Files that change

- `src/types.ts`: add `year: string` and `genre: string` (API gives year as a string, e.g. "1565"; confirm).
- `src/components/ArtPieceDetails.tsx` (new): `<article className="details">` with `<img>`, `<h2>` title, artist, year, genre, and a `<Link to="/art-pieces">Back</Link>`.
- `src/components/ArtPieceDetails.test.tsx` (new).
- `src/components/ArtPiecePreview.tsx`: wrap the figure content in `<Link to={`/art-pieces/${piece.slug}`}>`.
- `src/components/Spotlight.tsx`: wrap the figure content in the same `Link` to `/art-pieces/${piece.slug}` (user confirmed Spotlight should link too).
- `src/components/ArtPiecePreview.test.tsx`, `ArtPieces.test.tsx`, `Spotlight.test.tsx`, `App.test.tsx`: new tests, `year`/`genre` in fixtures, MemoryRouter wrapper where needed.
- `src/App.tsx`: add `<Route path="/art-pieces/:slug" element={...} />` before `*`. A small inner route component uses `useParams`, finds the piece in `pieces`, renders `ArtPieceDetails` or `<p>Art piece not found</p>`. Loading/error states reuse `renderWithPieces`.
- `src/styles.css`: only if needed (link colour/underline inside the figure); `.details` already exists.

## Out of scope

Favorite button, colors/dimensions, comments, a nav link to details, a separate NotFound component, history-based back (`navigate(-1)`).

## Open questions / decisions

1. `year` and `genre` are assumed to be strings; verified against the real API response in dev during implementation, types adjusted if different (confirmed with user).
2. Back button = `<Link to="/art-pieces">` rather than `navigate(-1)` (confirmed).
3. Both the gallery list and the Spotlight link to details (confirmed).

## Verification

`npx vitest run <file>` per new test (red first, then green), then `npm run check`, `lint`, `format:check`, `test:run`, `build`. In `npm run dev`: click a piece, check all fields, click Back, open `/art-pieces/the-harvesters` directly and `/art-pieces/nope`.
