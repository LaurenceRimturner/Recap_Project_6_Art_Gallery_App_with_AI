import { Link } from "react-router";

import type { ArtPiece } from "../types";
import CustomBadge from "./CustomBadge";
import FavoriteButton from "./FavoriteButton";

type ArtPiecePreviewProps = {
  piece: ArtPiece;
  isFavorite: boolean;
  onToggleFavorite: () => void;
};

export default function ArtPiecePreview({
  piece,
  isFavorite,
  onToggleFavorite,
}: ArtPiecePreviewProps) {
  return (
    <>
      <Link to={`/art-pieces/${piece.slug}`}>
        <figure>
          <img src={piece.imageSource} alt={piece.name} />
          <figcaption>
            &quot;{piece.name}&quot; by {piece.artist}
          </figcaption>
        </figure>
      </Link>
      {piece.isCustom && <CustomBadge />}
      <FavoriteButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
    </>
  );
}
