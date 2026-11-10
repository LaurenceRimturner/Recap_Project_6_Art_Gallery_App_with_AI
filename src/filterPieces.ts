import { type ColorFamily, colorFamily } from "./colorFamily";
import type { ArtPiece } from "./types";

export type Filters = {
  search: string;
  family: ColorFamily | null;
  genre: string;
};

export function filterPieces(
  pieces: ArtPiece[],
  { search, family, genre }: Filters
) {
  const query = search.trim().toLowerCase();
  return pieces.filter(
    (piece) =>
      (piece.name.toLowerCase().includes(query) ||
        piece.artist.toLowerCase().includes(query)) &&
      (family === null ||
        piece.colors.some((color) => colorFamily(color) === family)) &&
      (genre === "" || piece.genre === genre)
  );
}
