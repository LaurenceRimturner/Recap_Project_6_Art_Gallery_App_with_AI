import { fetcher } from "./fetcher";
import type { ArtPiece } from "./types";

afterEach(() => {
  vi.unstubAllGlobals();
});

test("returns the parsed data", async () => {
  const pieces: ArtPiece[] = [
    {
      slug: "wheat-field",
      artist: "Vincent van Gogh",
      name: "Wheat Field",
      imageSource: "https://example.com/wheat.jpg",
    },
  ];
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => pieces })
  );

  await expect(fetcher("https://example.com/api")).resolves.toEqual(pieces);
});

test("throws when the response is not ok", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));

  await expect(fetcher("https://example.com/api")).rejects.toThrow(
    "Request failed with status 500"
  );
});
