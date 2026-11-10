import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Heart } from "lucide-react";

type FavoriteButtonProps = {
  isFavorite: boolean;
  onToggle: () => void;
};

export default function FavoriteButton({
  isFavorite,
  onToggle,
}: FavoriteButtonProps) {
  const icon = useRef<HTMLSpanElement>(null);
  const mounted = useRef(false);

  // a small spring on the heart when it is switched, not on first render
  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true;
        return;
      }
      gsap.fromTo(
        icon.current,
        { scale: 0.7 },
        { scale: 1, duration: 0.5, ease: "back.out(3)", clearProps: "all" }
      );
    },
    { dependencies: [isFavorite] }
  );

  return (
    <button
      type="button"
      className="favorite-button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      onClick={onToggle}
    >
      <span ref={icon} className="favorite-icon">
        <Heart fill={isFavorite ? "currentColor" : "none"} aria-hidden="true" />
      </span>
    </button>
  );
}
