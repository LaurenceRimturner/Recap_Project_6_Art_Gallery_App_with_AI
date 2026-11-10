import { Link } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import useReveal from "../useReveal";
import ColorPalette from "./ColorPalette";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsProps = {
  piece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  comments: ArtPieceComment[];
  onAddComment: (text: string) => void;
  onEditComment: (date: string, text: string) => void;
  onDeleteComment: (date: string) => void;
};

export default function ArtPieceDetails({
  piece,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}: ArtPieceDetailsProps) {
  const article = useReveal<HTMLElement>(".details > :not(.favorite-button)");

  return (
    <article className="details" ref={article}>
      <Link to="/art-pieces">Back</Link>
      <img src={piece.imageSource} alt={piece.name} />
      <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      <h2>{piece.name}</h2>
      <p>Artist: {piece.artist}</p>
      <p>Year: {piece.year}</p>
      <p>Genre: {piece.genre}</p>
      <ColorPalette colors={piece.colors} />
      <Comments
        comments={comments}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
      >
        <CommentForm onAddComment={onAddComment} />
      </Comments>
    </article>
  );
}
