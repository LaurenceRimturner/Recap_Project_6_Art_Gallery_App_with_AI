import { Link } from "react-router";

import type { ArtPiece } from "../types";
import FavoriteButton from "./FavoriteButton";

type ArtPieceDetailsProps = {
  piece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function ArtPieceDetails({
  piece,
  isFavorite,
  onToggleFavorite,
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
    </article>
  );
}
