import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPiecesProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function ArtPieces({
  pieces,
  isFavorite,
  onToggleFavorite,
}: ArtPiecesProps) {
  return (
    <ul className="art-list">
      {pieces.map((piece) => (
        <li key={piece.slug} className="art-piece">
          <ArtPiecePreview
            piece={piece}
            isFavorite={isFavorite(piece.slug)}
            onToggleFavorite={() => onToggleFavorite(piece.slug)}
          />
        </li>
      ))}
    </ul>
  );
}
