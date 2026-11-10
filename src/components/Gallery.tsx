import { useState } from "react";

import type { ColorFamily } from "../colorFamily";
import { filterPieces } from "../filterPieces";
import type { ArtPiece } from "../types";
import ArtPieces from "./ArtPieces";
import ColorMoodBoard from "./ColorMoodBoard";

type GalleryProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

export default function Gallery({
  pieces,
  isFavorite,
  onToggleFavorite,
}: GalleryProps) {
  const [search, setSearch] = useState("");
  const [family, setFamily] = useState<ColorFamily | null>(null);
  const [genre, setGenre] = useState("");
  const [onlyCustom, setOnlyCustom] = useState(false);

  const genres = [...new Set(pieces.map((piece) => piece.genre))].sort();
  const visiblePieces = filterPieces(pieces, {
    search,
    family,
    genre,
    onlyCustom,
  });
  const hasCustomPieces = pieces.some((piece) => piece.isCustom);
  const hasActiveFilter =
    search !== "" || family !== null || genre !== "" || onlyCustom;

  function toggleFamily(toggled: ColorFamily) {
    setFamily((current) => (current === toggled ? null : toggled));
  }

  function clearFilters() {
    setSearch("");
    setFamily(null);
    setGenre("");
    setOnlyCustom(false);
  }

  return (
    <>
      <div className="filters">
        <label className="filter-search">
          Search by name or artist
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="filter-genre">
          Genre
          <select
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="">All genres</option>
            {genres.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>
        {hasCustomPieces && (
          <label className="filter-custom">
            <input
              type="checkbox"
              checked={onlyCustom}
              onChange={(event) => setOnlyCustom(event.target.checked)}
            />
            Only my art pieces
          </label>
        )}
        <button
          type="button"
          onClick={clearFilters}
          disabled={!hasActiveFilter}
        >
          Clear filters
        </button>
        <ColorMoodBoard
          colors={pieces.flatMap((piece) => piece.colors)}
          selected={family}
          onToggle={toggleFamily}
        />
      </div>
      <div role="status">
        {visiblePieces.length === 0 && "No art pieces found."}
      </div>
      {visiblePieces.length > 0 && (
        <ArtPieces
          pieces={visiblePieces}
          isFavorite={isFavorite}
          onToggleFavorite={onToggleFavorite}
        />
      )}
    </>
  );
}
