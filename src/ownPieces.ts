import { isHttpUrl } from "./isHttpUrl";
import type { ArtPiece } from "./types";

const TEXT_FIELDS = [
  "slug",
  "artist",
  "name",
  "imageSource",
  "year",
  "genre",
] as const;

function toOwnPiece(value: unknown): ArtPiece | null {
  if (typeof value !== "object" || value === null) return null;
  const entry = value as Record<string, unknown>;

  for (const field of TEXT_FIELDS) {
    const text = entry[field];
    if (typeof text !== "string" || text.trim() === "") return null;
  }
  if (!isHttpUrl(entry.imageSource as string)) return null;

  return {
    slug: entry.slug as string,
    artist: entry.artist as string,
    name: entry.name as string,
    imageSource: entry.imageSource as string,
    year: entry.year as string,
    genre: entry.genre as string,
    colors: [],
  };
}

/** Keeps only well-formed pieces from untrusted stored data. */
export function parseOwnPieces(stored: unknown): ArtPiece[] {
  if (!Array.isArray(stored)) return [];
  return stored.flatMap((entry) => toOwnPiece(entry) ?? []);
}
