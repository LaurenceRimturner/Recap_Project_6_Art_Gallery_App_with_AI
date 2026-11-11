import { type CSSProperties, type MouseEvent, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { useGSAP } from "@gsap/react";
import { Link } from "react-router";

import { pickRandom } from "../pickRandom";
import type { ArtPiece } from "../types";
import CustomBadge from "./CustomBadge";
import FavoriteButton from "./FavoriteButton";

gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin);

type Position = { x: number; y: number };

type SpotlightProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  position?: Position;
  onPositionChange?: (position: Position) => void;
};

export default function Spotlight({
  pieces,
  isFavorite,
  onToggleFavorite,
  position = { x: 0, y: 0 },
  onPositionChange,
}: SpotlightProps) {
  const [picked, setPicked] = useState(() => pickRandom(pieces));
  const piece = picked ?? pickRandom(pieces);

  if (piece && !picked) setPicked(piece);
  const wrapper = useRef<HTMLDivElement>(null);
  const figure = useRef<HTMLElement>(null);
  const dragged = useRef(false);

  // the whole piece moves; only the figure starts a drag, so the heart stays clickable
  useGSAP(
    () => {
      const node = wrapper.current;
      if (!node || !figure.current) return;
      gsap.set(node, { x: position.x, y: position.y });
      Draggable.create(node, {
        type: "x,y",
        trigger: figure.current,
        // the page, not the window: a window limit would snap a piece taller than the screen back on load
        bounds: node.closest("main") ?? window,
        dragClickables: true,
        // letting go while moving throws the piece onward and it slows down on its own
        inertia: true,
        // a new press starts a new interaction, so an old drag cannot swallow this tap
        onPress: () => {
          dragged.current = false;
          node.classList.add("is-dragging");
        },
        // while the piece is still being thrown the glow stays until the throw is over
        onRelease() {
          if (!this.isThrowing) node.classList.remove("is-dragging");
        },
        onDragStart: () => {
          dragged.current = true;
        },
        onDragEnd() {
          onPositionChange?.({ x: this.x, y: this.y });
        },
        // the throw moves the piece on after the release, so this is its final place
        onThrowComplete() {
          node.classList.remove("is-dragging");
          onPositionChange?.({ x: this.x, y: this.y });
        },
      });
    },
    { dependencies: [piece?.slug], scope: wrapper }
  );

  if (!piece) return null;

  // the glow takes its colors from the piece; without colors the CSS falls back to the accent
  const [glowA, glowB = glowA] = piece.colors;
  const glow = glowA
    ? ({ "--glow-a": glowA, "--glow-b": glowB } as CSSProperties)
    : undefined;

  // a drag ends with a click on the link, which must not open the details page
  function handleLinkClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!dragged.current) return;
    event.preventDefault();
    dragged.current = false;
  }

  return (
    <div className="art-piece spotlight" ref={wrapper} style={glow}>
      <Link to={`/art-pieces/${piece.slug}`} onClick={handleLinkClick}>
        <figure ref={figure}>
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
