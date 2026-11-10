import { useState } from "react";
import { Link } from "react-router";

import { pickRandom } from "../pickRandom";
import type { ArtPiece } from "../types";
import CustomBadge from "./CustomBadge";
import FavoriteButton from "./FavoriteButton";

type SpotlightProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function Spotlight({
  pieces,
  isFavorite,
  onToggleFavorite,
}: SpotlightProps) {
  const [picked, setPicked] = useState(() => pickRandom(pieces));
  const piece = picked ?? pickRandom(pieces);

  if (piece && !picked) setPicked(piece);
  if (!piece) return null;

  return (
    <div className="art-piece spotlight">
      <Link to={`/art-pieces/${piece.slug}`}>
        <figure>
          <img src={piece.imageSource} alt={piece.name} />
          <figcaption>
            &quot;{piece.name}&quot; by {piece.artist}
          </figcaption>
        </figure>
      </Link>
      {piece.isCustom && <CustomBadge />}
      <FavoriteButton
        isFavorite={isFavorite(piece.slug)}
        onToggle={() => onToggleFavorite(piece.slug)}
      />
    </div>
  );
}
