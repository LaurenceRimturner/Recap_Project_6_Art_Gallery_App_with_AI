# Plan: Issue 10 - Comments for Art Pieces

## Summary

Add a "Comments" section to the art piece details page: a list of comments (text and date/time) for the viewed piece, and a form (text field and submit button) that adds a comment to that piece only. Empty comments cannot be submitted.

## Findings

- `src/types.ts`: `ArtPieceInfo = { slug; isFavorite }`; no comment type yet.
- `src/App.tsx`: `artPiecesInfo` is plain `useState`; `toggleFavorite` creates `{ slug, isFavorite: true }` on first toggle. `ArtPieceRoute` renders `ArtPieceDetails`.
- `src/components/ArtPieceDetails.tsx`: props `piece, isFavorite, onToggleFavorite`.
- `src/styles.css` (lines ~362-427) already has `.comments` and `.comment-form` styles.
- Tests: `ArtPieceDetails.test.tsx` (MemoryRouter, `vi.fn()`), `App.test.tsx` (`renderApp`, stubbed fetch, SWR cache reset).
- No persistence (issue 12).

## Tests per acceptance criterion

| Criterion                              | Test (file: name)                                                                                                             | Asserts                                                                  |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Section labeled "Comments" with a list | `Comments.test.tsx`: renders a Comments heading and a list                                                                    | heading "Comments" and a list of the given comments                      |
| Comment text displayed                 | `Comments.test.tsx`: shows each comment's text                                                                                | each text is in the document                                             |
| Date and time displayed                | `Comments.test.tsx`: shows each comment's date and time                                                                       | `new Date(date).toLocaleString()` is shown per comment                   |
| Form with text field and submit button | `CommentForm.test.tsx`: renders a text field and a submit button                                                              | textbox and button by role                                               |
| Submit adds comment                    | `CommentForm.test.tsx`: calls onAddComment with the text; `ArtPieceDetails.test.tsx`: passes comments and add handler through | handler called with typed text; field cleared                            |
| Only to this art piece                 | `App.test.tsx`: a comment added on one piece does not show on another                                                         | add on `wheat-field`, navigate to `orange-red-and-green`, comment absent |
| Empty comments cannot be submitted     | `CommentForm.test.tsx`: does not submit empty or whitespace-only text                                                         | handler not called                                                       |

## Files that change

- `src/types.ts`: add `ArtPieceComment = { text: string; date: string }`; add `comments: ArtPieceComment[]` to `ArtPieceInfo`.
- `src/components/Comments.tsx` (+ test): "Comments" heading and list with text and `toLocaleString()` date.
- `src/components/CommentForm.tsx` (+ test): controlled text field and submit button; trims input, ignores empty, clears after submit.
- `src/components/ArtPieceDetails.tsx` (+ test): render `Comments` and `CommentForm`; new props `comments` and `onAddComment`. Existing renders in the test file need the new props (called out in the PR).
- `src/App.tsx`: `toggleFavorite` creates entries with `comments: []`; add `addComment(slug, text)` (stores `new Date().toISOString()`) and `getComments(slug)`; pass through `ArtPieceRoute`.
- `src/App.test.tsx`: cross-piece comment test.
- `src/styles.css`: only if the section does not lay out correctly inside `.details`.
- `docs/plans/10-comments-for-art-pieces.md`: this plan (created after approval).

## Out of scope

- Persistence (issue 12), editing or deleting comments, comment display on other pages.

## Open questions

None. Decided with the user: comments are listed newest first (`addComment` prepends; add a `Comments.test.tsx` test for order); whitespace-only counts as empty (input is trimmed); empty submit is ignored by the handler and the field is `required`.

## Verification

`npm run check`, `npm run lint`, `npm run format:check`, `npm run test:run`, `npm run build`; manually add comments on two pieces in `npm run dev` and confirm they stay separate.
