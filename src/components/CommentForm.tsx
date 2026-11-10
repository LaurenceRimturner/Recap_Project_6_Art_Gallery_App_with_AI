import { type FormEvent, useId, useState } from "react";

type CommentFormProps = {
  onAddComment: (text: string) => void;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
  const [text, setText] = useState("");
  const inputId = useId();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <label htmlFor={inputId}>Add a comment</label>
      <input
        id={inputId}
        type="text"
        placeholder="Write your comment here"
        value={text}
        onChange={(event) => setText(event.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}
