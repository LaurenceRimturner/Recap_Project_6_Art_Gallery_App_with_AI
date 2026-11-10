export const MIN_IMAGE_SIZE = 500;
export const MAX_IMAGE_SIZE = 2000;

/** Loads the image to read its natural size in pixels. */
export function loadImageSize(url: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("Image could not be loaded"));
    image.src = url;
  });
}

export function isAllowedImageSize({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  return [width, height].every(
    (side) => side >= MIN_IMAGE_SIZE && side <= MAX_IMAGE_SIZE
  );
}
