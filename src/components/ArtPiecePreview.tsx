import type { ArtPiece } from "../types";

type ArtPiecePreviewProps = {
  piece: ArtPiece;
};

export default function ArtPiecePreview({ piece }: ArtPiecePreviewProps) {
  return (
    <figure>
      <img src={piece.imageSource} alt={piece.name} />
      <figcaption>
        &quot;{piece.name}&quot; by {piece.artist}
      </figcaption>
    </figure>
  );
}
