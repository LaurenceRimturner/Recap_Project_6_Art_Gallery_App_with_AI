import { type ReactNode, useEffect, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import useSWR from "swr";

import ArtPieceDetails from "./components/ArtPieceDetails";
import ArtPieceModal, { type ArtPieceValues } from "./components/ArtPieceModal";
import ArtPieces from "./components/ArtPieces";
import Gallery from "./components/Gallery";
import Navigation from "./components/Navigation";
import PageTransition from "./components/PageTransition";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import { parseOwnPieces } from "./ownPieces";
import "@fontsource/inter/400.css";
import "@fontsource/inter/700.css";
import "./styles.css";
import type { ArtPiece, ArtPieceComment, ArtPieceInfo } from "./types";

const ART_API_URL = "https://example-apis.vercel.app/api/art";
const STORAGE_KEY = "art-pieces-info";
const OWN_PIECES_KEY = "own-art-pieces";

type ArtPieceRouteProps = {
  pieces: ArtPiece[];
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
  getComments: (slug: string) => ArtPieceComment[];
  onAddComment: (slug: string, text: string) => void;
  onEditComment: (slug: string, date: string, text: string) => void;
  onDeleteComment: (slug: string, date: string) => void;
  isOwnPiece: (slug: string) => boolean;
  onEditPiece: (slug: string) => void;
  onDeletePiece: (slug: string) => void;
};

function ArtPieceRoute({
  pieces,
  isFavorite,
  onToggleFavorite,
  getComments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  isOwnPiece,
  onEditPiece,
  onDeletePiece,
}: ArtPieceRouteProps) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const piece = pieces.find((candidate) => candidate.slug === slug);

  if (!piece) return <p>Art piece not found</p>;
  return (
    <ArtPieceDetails
      piece={piece}
      isFavorite={isFavorite(piece.slug)}
      onToggleFavorite={() => onToggleFavorite(piece.slug)}
      comments={getComments(piece.slug)}
      onAddComment={(text) => onAddComment(piece.slug, text)}
      onEditComment={(date, text) => onEditComment(piece.slug, date, text)}
      onDeleteComment={(date) => onDeleteComment(piece.slug, date)}
      onEdit={
        isOwnPiece(piece.slug) ? () => onEditPiece(piece.slug) : undefined
      }
      onDelete={
        isOwnPiece(piece.slug)
          ? () => {
              onDeletePiece(piece.slug);
              navigate("/art-pieces");
            }
          : undefined
      }
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

function loadOwnPieces(): ArtPiece[] {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(OWN_PIECES_KEY) ?? "[]"
    );
    return parseOwnPieces(stored);
  } catch {
    return [];
  }
}

export default function App() {
  const { data, error } = useSWR<ArtPiece[]>(ART_API_URL, fetcher);
  const [artPiecesInfo, setArtPiecesInfo] =
    useState<ArtPieceInfo[]>(loadArtPiecesInfo);

  const [ownPieces, setOwnPieces] = useState<ArtPiece[]>(loadOwnPieces);
  // null = closed, empty object = adding, slug = editing that piece
  const [modal, setModal] = useState<{ slug?: string } | null>(null);
  // kept here so the dragged spotlight keeps its place across page changes
  const [spotlightPosition, setSpotlightPosition] = useState({ x: 0, y: 0 });
  const { pathname } = useLocation();
  const isFirstPage = useRef(true);

  useEffect(() => {
    isFirstPage.current = false;
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artPiecesInfo));
  }, [artPiecesInfo]);

  useEffect(() => {
    localStorage.setItem(OWN_PIECES_KEY, JSON.stringify(ownPieces));
  }, [ownPieces]);

  function isOwnPiece(slug: string) {
    return ownPieces.some((piece) => piece.slug === slug);
  }

  function savePiece(values: ArtPieceValues) {
    const editingSlug = modal?.slug;
    if (editingSlug) {
      setOwnPieces((current) =>
        current.map((piece) =>
          piece.slug === editingSlug ? { ...piece, ...values } : piece
        )
      );
    } else {
      const slug = `own-${crypto.randomUUID()}`;
      setOwnPieces((current) => [{ slug, ...values, colors: [] }, ...current]);
    }
    setModal(null);
  }

  function deletePiece(slug: string) {
    setOwnPieces((current) => current.filter((piece) => piece.slug !== slug));
    setArtPiecesInfo((current) => current.filter((info) => info.slug !== slug));
  }

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

  function updateComments(
    slug: string,
    update: (comments: ArtPieceComment[]) => ArtPieceComment[]
  ) {
    setArtPiecesInfo((current) =>
      current.map((info) =>
        info.slug === slug ? { ...info, comments: update(info.comments) } : info
      )
    );
  }

  function editComment(slug: string, date: string, text: string) {
    updateComments(slug, (comments) =>
      comments.map((comment) =>
        comment.date === date ? { ...comment, text } : comment
      )
    );
  }

  function deleteComment(slug: string, date: string) {
    updateComments(slug, (comments) =>
      comments.filter((comment) => comment.date !== date)
    );
  }

  function renderWithPieces(render: (pieces: ArtPiece[]) => ReactNode) {
    if (error) return <p>Failed to load art pieces.</p>;
    if (!data) return <p>Loading...</p>;
    const custom = ownPieces.map((piece) => ({ ...piece, isCustom: true }));
    return render([...custom, ...data]);
  }

  return (
    <>
      <main>
        <h1>
          <Link to="/">Art Gallery</Link>
        </h1>
        <PageTransition key={pathname} animate={!isFirstPage.current}>
          <Routes>
            <Route
              path="/"
              element={renderWithPieces((pieces) => (
                <Spotlight
                  pieces={pieces}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  position={spotlightPosition}
                  onPositionChange={setSpotlightPosition}
                />
              ))}
            />
            <Route
              path="/art-pieces"
              element={renderWithPieces((pieces) => (
                <Gallery
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
                  onEditComment={editComment}
                  onDeleteComment={deleteComment}
                  isOwnPiece={isOwnPiece}
                  onEditPiece={(slug) => setModal({ slug })}
                  onDeletePiece={deletePiece}
                />
              ))}
            />
            <Route
              path="/favorites"
              element={renderWithPieces((pieces) => {
                const favorites = pieces.filter((piece) =>
                  isFavorite(piece.slug)
                );
                return (
                  <>
                    {favorites.length === 0 && (
                      <div className="empty-state">
                        <p className="empty-face" aria-hidden="true">
                          ಥ_ಥ
                        </p>
                        <p>No favorites yet</p>
                        <Link to="/art-pieces">Browse the gallery</Link>
                      </div>
                    )}
                    <ArtPieces
                      pieces={favorites}
                      isFavorite={isFavorite}
                      onToggleFavorite={toggleFavorite}
                    />
                  </>
                );
              })}
            />
            <Route path="*" element={<p>Page not found</p>} />
          </Routes>
        </PageTransition>
      </main>
      <Navigation onAddClick={() => setModal({})} />
      {modal && (
        <ArtPieceModal
          key={modal.slug ?? "new"}
          piece={ownPieces.find((piece) => piece.slug === modal.slug)}
          onSave={savePiece}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
