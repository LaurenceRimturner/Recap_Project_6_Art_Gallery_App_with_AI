# Plan: #36 Improve the Comment Section (Edit, Delete, Visibility, Fade-in)

## Summary

Comments get Edit and Delete (inline, with save/cancel and a delete confirmation), changes are persisted in `localStorage` like the existing comments, the comment input becomes clearly visible, the comments move into their own separated section with a heading, and only newly added comments fade in.

## Test per acceptance criterion

| Criterion                                     | Test (file, name)                                                                                                                         | Asserts                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Edit button turns text into a prefilled field | `Comments.test.tsx` "shows an Edit and a Delete button on each comment" / "turns the comment into a prefilled field when Edit is clicked" | Buttons per comment; textbox holds the current text      |
| Save updates, cancel keeps the original       | `Comments.test.tsx` "saves the edited text" / "keeps the original text when editing is cancelled"                                         | Edited text shown; original text after cancel            |
| Empty or whitespace-only edit cannot be saved | `Comments.test.tsx` "does not save an empty or whitespace-only edit"                                                                      | Save handler not called                                  |
| Delete asks for confirmation                  | `Comments.test.tsx` "asks for confirmation before deleting and deletes on confirm" / "keeps the comment when the deletion is cancelled"   | Confirm removes the comment, cancel keeps it             |
| Changes survive a reload                      | `App.test.tsx` "edits a comment and saves it to localStorage" / "deletes a comment and removes it from localStorage"                      | Stored JSON reflects the edit / deletion                 |
| Comment input clearly visible                 | `CommentForm.test.tsx` "has a visible label and placeholder on the field"                                                                 | Label and placeholder present                            |
| Own section with heading, separated           | `ArtPieceDetails.test.tsx` "shows the comments in their own section with the form inside it"                                              | Section with heading containing the form                 |
| New comment fades in, existing ones do not    | `Comments.test.tsx` "fades in only comments added after the first render"                                                                 | Fade class only on comments added after the first render |
| Edit and delete only affect the current piece | `App.test.tsx` "passes edit and delete of a comment on"; `ArtPieceDetails.test.tsx` (reset per piece, see #38)                            | Other pieces' comments unchanged                         |

## Files that change

- `src/components/Comments.tsx`: edit mode (save/cancel), delete with confirmation, fade-in for new comments only.
- `src/components/CommentForm.tsx`: visible label/placeholder on the input.
- `src/components/ArtPieceDetails.tsx`: comments in their own section with a heading.
- `src/App.tsx`: edit and delete handlers for comments, persisted with the existing comments storage.
- `src/styles.css`: input, separated section and fade-in animation in the Swiss grid style, scoped away from the color palette.
- Tests: additions to `Comments.test.tsx`, `CommentForm.test.tsx`, `ArtPieceDetails.test.tsx`, `App.test.tsx`.

## Out of scope

- Editing or deleting other users' comments (there are no users).
- Edit history, timestamps for edits, undo after delete.
