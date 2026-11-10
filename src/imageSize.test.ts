import { imageStub } from "./testImage";
import { loadImageSize } from "./imageSize";

test("resolves with the natural size of the image", async () => {
  imageStub.width = 640;
  imageStub.height = 480;

  await expect(loadImageSize("https://example.com/a.jpg")).resolves.toEqual({
    width: 640,
    height: 480,
  });
});

test("rejects when the image cannot be loaded", async () => {
  imageStub.fails = true;

  await expect(loadImageSize("https://example.com/a.jpg")).rejects.toThrow();
});
