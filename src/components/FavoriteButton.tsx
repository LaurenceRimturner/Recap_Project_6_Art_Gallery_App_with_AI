import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      onClick={onToggle}
    >
      <Heart fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
    </button>
  );
}
