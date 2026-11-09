import { type ReactNode, useState } from "react";
import { Route, Routes, useParams } from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieces from "./components/ArtPieces";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece, ArtPieceInfo } from "./types";

const ART_API_URL = "https://example-apis.vercel.app/api/art";

type ArtPieceRouteProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
};

function ArtPieceRoute({
  pieces,
  isFavorite,
  onToggleFavorite,
}: ArtPieceRouteProps) {
  const { slug } = useParams();
  const piece = pieces.find((candidate) => candidate.slug === slug);

  if (!piece) return <p>Art piece not found</p>;
  return (
    <ArtPieceDetails
      piece={piece}
      isFavorite={isFavorite(piece.slug)}
      onToggleFavorite={() => onToggleFavorite(piece.slug)}
    />
  );
}

export default function App() {
  const { data, error } = useSWR<ArtPiece[]>(ART_API_URL, fetcher);
  const [artPiecesInfo, setArtPiecesInfo] = useState<ArtPieceInfo[]>([]);

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
        : [...current, { slug, isFavorite: true }]
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
