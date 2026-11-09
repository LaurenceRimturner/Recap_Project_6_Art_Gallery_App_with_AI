import { type FormEvent, useState } from "react";

type CommentFormProps = {
  onAddComment: (text: string) => void;
};

export default function CommentForm({ onAddComment }: CommentFormProps) {
  const [text, setText] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  }

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      <input
        type="text"
        aria-label="Comment"
        value={text}
        onChange={(event) => setText(event.target.value)}
        required
      />
      <button type="submit">Submit</button>
    </form>
  );
}
