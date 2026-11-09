import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPiecesProps = {
  pieces: ArtPiece[];
};

export default function ArtPieces({ pieces }: ArtPiecesProps) {
  return (
    <ul className="art-list">
      {pieces.map((piece) => (
        <li key={piece.slug} className="art-piece">
          <ArtPiecePreview piece={piece} />
        </li>
      ))}
    </ul>
  );
}
