import { type ReactNode, useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieces from "./components/ArtPieces";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece, ArtPieceComment, ArtPieceInfo } from "./types";

const ART_API_URL = "https://example-apis.vercel.app/api/art";
const STORAGE_KEY = "art-pieces-info";

type ArtPieceRouteProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  getComments: (slug: string) => ArtPieceComment[];
  onAddComment: (slug: string, text: string) => void;
};

function ArtPieceRoute({
  pieces,
  isFavorite,
  onToggleFavorite,
  getComments,
  onAddComment,
}: ArtPieceRouteProps) {
  const { slug } = useParams();
  const piece = pieces.find((candidate) => candidate.slug === slug);

  if (!piece) return <p>Art piece not found</p>;
  return (
    <ArtPieceDetails
      piece={piece}
      isFavorite={isFavorite(piece.slug)}
      onToggleFavorite={() => onToggleFavorite(piece.slug)}
      comments={getComments(piece.slug)}
      onAddComment={(text) => onAddComment(piece.slug, text)}
    />
  );
}

function loadArtPiecesInfo(): ArtPieceInfo[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    return Array.isArray(stored) ? (stored as ArtPieceInfo[]) : [];
  } catch {
    return [];
  }
}

export default function App() {
  const { data, error } = useSWR<ArtPiece[]>(ART_API_URL, fetcher);
  const [artPiecesInfo, setArtPiecesInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
  }, [artPiecesInfo]);

  function isFavorite(slug: string) {
    return artPiecesInfo.some((info) => info.slug === slug && info.isFavorite);
  }

  function toggleFavorite(slug: string) {
    setArtPiecesInfo((current) =>
      current.some((info) => info.slug === slug)
        ? current.map((info) =>
            info.slug === slug
              ? { ...info, isFavorite: !info.isFavorite }
              : info
          )
        : [...current, { slug, isFavorite: true, comments: [] }]
    );
  }

  function getComments(slug: string) {
    return artPiecesInfo.find((info) => info.slug === slug)?.comments ?? [];
  }

  function addComment(slug: string, text: string) {
    const comment: ArtPieceComment = { text, date: new Date().toISOString() };
    setArtPiecesInfo((current) =>
      current.some((info) => info.slug === slug)
        ? current.map((info) =>
            info.slug === slug
              ? { ...info, comments: [comment, ...info.comments] }
              : info
          )
        : [...current, { slug, isFavorite: false, comments: [comment] }]
    );
  }

  function renderWithPieces(render: (pieces: ArtPiece[]) => ReactNode) {
    if (error) return <p>Failed to load art pieces.</p>;
    if (!data) return <p>Loading...</p>;
    return render(data);
  }

  return (
    <>
      <main>
        <h1>Art Gallery</h1>
        <Routes>
          <Route
            path="/"
            element={renderWithPieces((pieces) => (
              <Spotlight
                pieces={pieces}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route
            path="/art-pieces"
            element={renderWithPieces((pieces) => (
              <ArtPieces
                pieces={pieces}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route
            path="/art-pieces/:slug"
            element={renderWithPieces((pieces) => (
              <ArtPieceRoute
                pieces={pieces}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
                getComments={getComments}
                onAddComment={addComment}
              />
            ))}
          />
          <Route
            path="/favorites"
            element={renderWithPieces((pieces) => (
              <ArtPieces
                pieces={pieces.filter((piece) => isFavorite(piece.slug))}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
      <Navigation />
    </>
  );
}
