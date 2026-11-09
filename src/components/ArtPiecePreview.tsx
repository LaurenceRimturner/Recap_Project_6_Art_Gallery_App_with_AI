import { Link } from "react-router";

import type { ArtPiece } from "../types";

type ArtPiecePreviewProps = {
  piece: ArtPiece;
};

export default function ArtPiecePreview({ piece }: ArtPiecePreviewProps) {
  return (
    <Link to={`/art-pieces/${piece.slug}`}>
      <figure>
        <img src={piece.imageSource} alt={piece.name} />
        <figcaption>
          &quot;{piece.name}&quot; by {piece.artist}
        </figcaption>
      </figure>
    </Link>
  );
}
