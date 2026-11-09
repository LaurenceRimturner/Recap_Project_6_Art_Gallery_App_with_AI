import { Link } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsProps = {
  piece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  comments: ArtPieceComment[];
  onAddComment: (text: string) => void;
};

export default function ArtPieceDetails({
  piece,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
}: ArtPieceDetailsProps) {
  return (
    <article className="details">
      <Link to="/art-pieces">Back</Link>
      <img src={piece.imageSource} alt={piece.name} />
      <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      <h2>{piece.name}</h2>
      <p>Artist: {piece.artist}</p>
      <p>Year: {piece.year}</p>
      <p>Genre: {piece.genre}</p>
      <Comments comments={comments} />
      <CommentForm onAddComment={onAddComment} />
    </article>
  );
}
