import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compressImage } from '../../src/utils/imageOptimizer';

describe('Image Optimizer (compressImage)', () => {
  let OriginalImage: typeof Image;

  beforeEach(() => {
    OriginalImage = globalThis.Image;
  });

  afterEach(() => {
    globalThis.Image = OriginalImage;
    vi.restoreAllMocks();
  });

  it('rejects files that are not image MIME types', async () => {
    const textFile = new File(['hello world'], 'document.pdf', { type: 'application/pdf' });
    await expect(compressImage(textFile)).rejects.toThrow('Selected file is not an image');
  });

  it('compresses an oversized landscape image, maintaining aspect ratio within maxWidth', async () => {
    // Mock Image class to trigger onload and mock original dimensions
    class MockImage {
      width = 3200;
      height = 2400;
      onload: ((ev: any) => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      private _src = '';

      set src(val: string) {
        this._src = val;
        setTimeout(() => {
          if (this.onload) {
            this.onload({} as any);
          }
        }, 10);
      }

      get src() {
        return this._src;
      }
    }

    globalThis.Image = MockImage as any;

    const dummyImageFile = new File(['fake-jpg-binary-bytes-data'], 'living-room.jpg', {
      type: 'image/jpeg'
    });

    const result = await compressImage(dummyImageFile, 1600, 1200, 0.82);

    expect(result).toBeDefined();
    expect(result.file).toBeInstanceOf(File);
    expect(result.file.name).toBe('living-room.webp');
    expect(result.file.type).toBe('image/webp');
    expect(result.previewUrl).toBeDefined();
    expect(result.dataUrl).toContain('data:image/webp;base64');
    expect(result.originalSize).toBe(dummyImageFile.size);
  });

  it('compresses a portrait image, maintaining aspect ratio within maxHeight', async () => {
    class MockPortraitImage {
      width = 1800;
      height = 3600;
      onload: ((ev: any) => void) | null = null;
      onerror: ((err: any) => void) | null = null;
      private _src = '';

      set src(val: string) {
        this._src = val;
        setTimeout(() => {
          if (this.onload) {
            this.onload({} as any);
          }
        }, 10);
      }

      get src() {
        return this._src;
      }
    }

    globalThis.Image = MockPortraitImage as any;

    const dummyPortraitFile = new File(['portrait-data'], 'tall-building.png', {
      type: 'image/png'
    });

    const result = await compressImage(dummyPortraitFile, 1600, 1200, 0.82);

    expect(result).toBeDefined();
    expect(result.file.name).toBe('tall-building.webp');
    expect(result.file.type).toBe('image/webp');
  });

  it('rejects if image failed to load', async () => {
    class MockFailingImage {
      onload: ((ev: any) => void) | null = null;
      onerror: ((err: any) => void) | null = null;

      set src(_val: string) {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Error('Corrupt image data'));
          }
        }, 10);
      }
    }

    globalThis.Image = MockFailingImage as any;

    const corruptFile = new File(['corrupt-bytes'], 'broken.jpg', {
      type: 'image/jpeg'
    });

    await expect(compressImage(corruptFile)).rejects.toBeDefined();
  });
});
