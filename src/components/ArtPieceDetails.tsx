import { Link } from "react-router";

import type { ArtPiece } from "../types";

type ArtPieceDetailsProps = {
  piece: ArtPiece;
};

export default function ArtPieceDetails({ piece }: ArtPieceDetailsProps) {
  return (
    <article className="details">
      <Link to="/art-pieces">Back</Link>
      <img src={piece.imageSource} alt={piece.name} />
      <h2>{piece.name}</h2>
      <p>Artist: {piece.artist}</p>
      <p>Year: {piece.year}</p>
      <p>Genre: {piece.genre}</p>
    </article>
  );
}
