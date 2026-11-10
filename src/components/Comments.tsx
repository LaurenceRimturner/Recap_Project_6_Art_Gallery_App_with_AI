import { type FormEvent, type ReactNode, useState } from "react";

import type { ArtPieceComment } from "../types";

type CommentsProps = {
  comments: ArtPieceComment[];
  onEditComment: (date: string, text: string) => void;
  onDeleteComment: (date: string) => void;
  children?: ReactNode;
};

type CommentItemProps = {
  comment: ArtPieceComment;
  isNew: boolean;
  onEdit: (text: string) => void;
  onDelete: () => void;
};

function CommentItem({ comment, isNew, onEdit, onDelete }: CommentItemProps) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm-delete">("view");
  const [draft, setDraft] = useState(comment.text);

  function startEditing() {
    setDraft(comment.text);
    setMode("edit");
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onEdit(trimmed);
    setMode("view");
  }

  return (
    <li className={isNew ? "fade-in" : undefined}>
      {mode === "edit" ? (
        <form className="comment-edit" onSubmit={handleSave}>
          <input
            type="text"
            aria-label="Edit comment"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            required
          />
          <div className="comment-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={() => setMode("view")}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>{comment.text}</p>
          <time dateTime={comment.date}>
            {new Date(comment.date).toLocaleString()}
          </time>
          <div className="comment-actions">
            {mode === "confirm-delete" ? (
              <>
                <button type="button" onClick={onDelete}>
                  Confirm delete
                </button>
                <button type="button" onClick={() => setMode("view")}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={startEditing}>
                  Edit
                </button>
                <button type="button" onClick={() => setMode("confirm-delete")}>
                  Delete
                </button>
              </>
            )}
          </div>
        </>
      )}
    </li>
  );
}

export default function Comments({
  comments,
  onEditComment,
  onDeleteComment,
  children,
}: CommentsProps) {
  // comments present on the first render appear instantly, later ones fade in
  const [initialDates] = useState(
    () => new Set(comments.map((comment) => comment.date))
  );

  return (
    <section className="comment-section">
      <h3>Comments</h3>
      {children}
      <ul className="comments">
        {comments.map((comment) => (
          <CommentItem
            key={comment.date}
            comment={comment}
            isNew={!initialDates.has(comment.date)}
            onEdit={(text) => onEditComment(comment.date, text)}
            onDelete={() => onDeleteComment(comment.date)}
          />
        ))}
      </ul>
    </section>
  );
}
