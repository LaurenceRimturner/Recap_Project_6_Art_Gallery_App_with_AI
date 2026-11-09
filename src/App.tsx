import type { ReactNode } from "react";
import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieces from "./components/ArtPieces";
import Navigation from "./components/Navigation";
import Spotlight from "./components/Spotlight";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const ART_API_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const { data, error } = useSWR<ArtPiece[]>(ART_API_URL, fetcher);

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
              <Spotlight pieces={pieces} />
            ))}
          />
          <Route
            path="/art-pieces"
            element={renderWithPieces((pieces) => (
              <ArtPieces pieces={pieces} />
            ))}
          />
          <Route path="*" element={<p>Page not found</p>} />
        </Routes>
      </main>
      <Navigation />
    </>
  );
}
