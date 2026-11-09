import { Route, Routes } from "react-router";
import useSWR from "swr";

import ArtPieces from "./components/ArtPieces";
import { fetcher } from "./fetcher";
import "./styles.css";
import type { ArtPiece } from "./types";

const ART_API_URL = "https://example-apis.vercel.app/api/art";

export default function App() {
  const { data, error } = useSWR<ArtPiece[]>(ART_API_URL, fetcher);

  function renderArtPieces() {
    if (error) return <p>Failed to load art pieces.</p>;
    if (!data) return <p>Loading...</p>;
    return <ArtPieces pieces={data} />;
  }

  return (
    <main>
      <h1>Art Gallery</h1>
      <Routes>
        <Route path="/art-pieces" element={renderArtPieces()} />
      </Routes>
    </main>
  );
}
