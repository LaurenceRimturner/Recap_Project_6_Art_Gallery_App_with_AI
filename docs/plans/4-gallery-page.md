# Plan: Issue 4 - Gallery Page

## Summary

The Gallery page lists all art pieces at `/art-pieces`. Each entry shows the image, the title and the artist's name. The data is fetched once in `App.tsx` with `useSWR` and passed down as props, with loading and error states.

## Findings

- `src/App.tsx` is a placeholder. `src/index.tsx` already wraps `<App />` in `BrowserRouter`, so `App` needs no router of its own, but tests must wrap it in `MemoryRouter`.
- API: `https://example-apis.vercel.app/api/art`, array of `{ slug, artist, name, imageSource, year, genre, colors, dimensions }` (README). The issue says to type only what is used: `slug`, `artist`, `name`, `imageSource`.
- No tests exist yet. Vitest globals and jest-dom are set up (`src/setupTests.ts`, `vite.config.ts`).
- Wireframe, Art Pieces page: a vertical list, each entry an image with `"Title" by Artist` below it. The heart button belongs to issue 8 and is out of scope.

## Tests per acceptance criterion

| Criterion                            | Test (file: name)                                                        | Asserts                                                                                      |
| ------------------------------------ | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- |
| All art pieces in a list             | `src/components/ArtPieces.test.tsx`: renders one list item per art piece | `getAllByRole("listitem")` has the same length as the input array                            |
| Image displayed                      | `src/components/ArtPiecePreview.test.tsx`: shows the image               | `getByRole("img", { name: <title> })` has `src` equal to `imageSource`                       |
| Title displayed                      | `ArtPiecePreview.test.tsx`: shows the title                              | the title text is in the document                                                            |
| Artist's name displayed              | `ArtPiecePreview.test.tsx`: shows the artist's name                      | the artist's name text is in the document                                                    |
| List on route `/art-pieces`          | `src/App.test.tsx`: shows the list on /art-pieces                        | with `MemoryRouter initialEntries={["/art-pieces"]}` and a mocked `fetch`, the titles appear |
| Task: `fetcher` returns `ArtPiece[]` | `src/fetcher.test.ts`: returns the parsed data                           | with `fetch` mocked to `ok`, resolves to the array                                           |
| Task: error state                    | `fetcher.test.ts`: throws when the response is not ok                    | rejects with an `Error`                                                                      |
| Task: error state in UI              | `App.test.tsx`: shows an error message when loading fails                | with `fetch` mocked to fail, an error text is shown                                          |
| Task: loading state                  | `App.test.tsx`: shows a loading message first                            | a loading text is shown before data arrives                                                  |

Each SWR test uses a fresh cache (`<SWRConfig value={{ provider: () => new Map() }}>`) so tests do not share data.

## Files that change

- `src/types.ts` (new): `ArtPiece` type (`slug`, `artist`, `name`, `imageSource`).
- `src/fetcher.ts` (new): `fetcher(url): Promise<ArtPiece[]>`, throws `Error` when `!response.ok`.
- `src/components/ArtPiecePreview.tsx` (new): one entry, an `img` with `alt` set to the title, and a caption `"title" by artist`.
- `src/components/ArtPieces.tsx` (new): `ul` mapping to `<li>` + `ArtPiecePreview`, keyed by `slug`.
- `src/App.tsx` (modify): `useSWR`, loading and error states, `<Routes>` with `/art-pieces` rendering the list.
- Test files next to each of the above (`.tsx`/`.ts`).
- `src/styles.css`: only minimal styling for the list and images, if needed.

## Out of scope

Favorite buttons, the details page, the Spotlight page, navigation bar and links to details (issues 5-8), persistence, and a route for `/` beyond what exists.

## Decisions (approved defaults)

1. Components in `src/components/` (flat), fetcher in `src/fetcher.ts`.
2. Loading and error shown as plain text ("Loading..." / "Failed to load art pieces.") with no spinner or retry.
3. Plain `<img>` with `alt` set to the title (no lazy loading or sizing logic).
