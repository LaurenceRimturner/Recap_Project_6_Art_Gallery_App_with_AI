import { useState } from "react";
import { Link } from "react-router";

import type { ArtPiece, ArtPieceComment } from "../types";
import useReveal from "../useReveal";
import ColorPalette from "./ColorPalette";
import CustomBadge from "./CustomBadge";
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
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function ArtPieceDetails({
  piece,
  isFavorite,
  onToggleFavorite,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onEdit,
  onDelete,
}: ArtPieceDetailsProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const article = useReveal<HTMLElement>(".details > :not(.favorite-button)");

  return (
    <article className="details" ref={article}>
      <Link to="/art-pieces">Back</Link>
      <img src={piece.imageSource} alt={piece.name} />
      <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      <h2>{piece.name}</h2>
      {piece.isCustom && <CustomBadge />}
      <p>Artist: {piece.artist}</p>
      <p>Year: {piece.year}</p>
      <p>Genre: {piece.genre}</p>
      {onEdit && onDelete && (
        <div className="piece-actions">
          <button type="button" onClick={onEdit}>
            Edit art piece
          </button>
          {confirmingDelete ? (
            <>
              <button type="button" className="danger" onClick={onDelete}>
                Confirm delete art piece
              </button>
              <button type="button" onClick={() => setConfirmingDelete(false)}>
                Keep art piece
              </button>
            </>
          ) : (
            <button
              type="button"
              className="danger"
              onClick={() => setConfirmingDelete(true)}
            >
              Delete art piece
            </button>
          )}
        </div>
      )}
      <ColorPalette colors={piece.colors} />
      <Comments
        key={piece.slug}
        comments={comments}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
      >
        <CommentForm onAddComment={onAddComment} />
      </Comments>
    </article>
  );
}
