import { useState } from "react";
import { Link } from "react-router";

import { pickRandom } from "../pickRandom";
import type { ArtPiece } from "../types";

type SpotlightProps = {
  pieces: ArtPiece[];
};

export default function Spotlight({ pieces }: SpotlightProps) {
  const [picked, setPicked] = useState(() => pickRandom(pieces));
  const piece = picked ?? pickRandom(pieces);

  if (piece && !picked) setPicked(piece);
  if (!piece) return null;

  return (
    <Link to={`/art-pieces/${piece.slug}`}>
      <figure className="art-piece spotlight">
        <img src={piece.imageSource} alt={piece.name} />
        <figcaption>
          &quot;{piece.name}&quot; by {piece.artist}
        </figcaption>
      </figure>
    </Link>
  );
}
