import type { ArtPiece } from "../types";
import ArtPiecePreview from "./ArtPiecePreview";

type ArtPiecesProps = {
  pieces: ArtPiece[];
};

export default function ArtPieces({ pieces }: ArtPiecesProps) {
  return (
    <ul>
      {pieces.map((piece) => (
        <li key={piece.slug}>
          <ArtPiecePreview piece={piece} />
        </li>
      ))}
    </ul>
  );
}
