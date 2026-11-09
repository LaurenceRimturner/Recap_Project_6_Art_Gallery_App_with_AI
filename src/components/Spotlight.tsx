import { useState } from "react";

import { pickRandom } from "../pickRandom";
import type { ArtPiece } from "../types";

type SpotlightProps = {
  pieces: ArtPiece[];
};

export default function Spotlight({ pieces }: SpotlightProps) {
  const [piece] = useState(() => pickRandom(pieces));

  if (!piece) return null;

  return (
    <figure className="art-piece spotlight">
      <img src={piece.imageSource} alt={piece.name} />
      <figcaption>
        &quot;{piece.name}&quot; by {piece.artist}
      </figcaption>
    </figure>
  );
}
