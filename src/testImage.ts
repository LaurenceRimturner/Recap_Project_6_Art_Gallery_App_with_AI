/** Controls what the stubbed Image reports; jsdom does not load images. */
export const imageStub = { width: 1000, height: 1000, fails: false };

export function resetImageStub() {
  imageStub.width = 1000;
  imageStub.height = 1000;
  imageStub.fails = false;
}

class StubImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = 0;
  naturalHeight = 0;

  set src(_value: string) {
    queueMicrotask(() => {
      if (imageStub.fails) {
        this.onerror?.();
        return;
      }
      this.naturalWidth = imageStub.width;
      this.naturalHeight = imageStub.height;
      this.onload?.();
    });
  }
}

export function installImageStub() {
  globalThis.Image = StubImage as unknown as typeof Image;
}
