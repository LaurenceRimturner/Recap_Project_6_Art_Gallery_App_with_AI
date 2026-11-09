import type { ArtPieceComment } from "../types";

type CommentsProps = {
  comments: ArtPieceComment[];
};

export default function Comments({ comments }: CommentsProps) {
  return (
    <section>
      <h3>Comments</h3>
      <ul className="comments">
        {comments.map((comment) => (
          <li key={comment.date}>
            <p>{comment.text}</p>
            <time dateTime={comment.date}>
              {new Date(comment.date).toLocaleString()}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
