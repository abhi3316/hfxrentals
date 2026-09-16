import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRemove = vi.fn();
const mockFrom = vi.fn(() => ({ remove: mockRemove }));

vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    storage: {
      from: (...args: any[]) => mockFrom(...args)
    }
  }
}));

import { extractStorageFilePath, deleteListingPhotos } from '../../src/utils/storage';

describe('Storage Engine (storage.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('extractStorageFilePath', () => {
    it('extracts relative path from standard Supabase public storage URL', () => {
      const url = 'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/1741550000000-abc1234.webp';
      expect(extractStorageFilePath(url)).toBe('listings/1741550000000-abc1234.webp');
    });

    it('strips query parameters and hashes from Supabase URLs', () => {
      const url = 'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/photo.webp?token=xyz#section';
      expect(extractStorageFilePath(url)).toBe('listings/photo.webp');
    });

    it('decodes URI encoded characters in filenames', () => {
      const url = 'https://example.supabase.co/storage/v1/object/public/listing-photos/listings/bed%20room%201.webp';
      expect(extractStorageFilePath(url)).toBe('listings/bed room 1.webp');
    });

    it('supports direct relative storage paths starting with listings/', () => {
      expect(extractStorageFilePath('listings/test-image.webp')).toBe('listings/test-image.webp');
    });

    it('returns null for external non-Supabase URLs (e.g. Unsplash, external CDN)', () => {
      expect(extractStorageFilePath('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format')).toBeNull();
      expect(extractStorageFilePath('https://example.com/external-photo.jpg')).toBeNull();
    });

    it('returns null for base64 data URLs and invalid input', () => {
      expect(extractStorageFilePath('data:image/webp;base64,UklGRk...')).toBeNull();
      expect(extractStorageFilePath('')).toBeNull();
      expect(extractStorageFilePath(null as any)).toBeNull();
      expect(extractStorageFilePath(undefined as any)).toBeNull();
    });
  });

  describe('deleteListingPhotos', () => {
    it('returns false and does not call storage when imageUrls is empty', async () => {
      const res = await deleteListingPhotos([]);
      expect(res).toBe(false);
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('returns false and does not call storage when all photos are external (e.g. Unsplash mock images)', async () => {
      const res = await deleteListingPhotos([
        'https://images.unsplash.com/photo-1522708323590?auto=format',
        'https://images.unsplash.com/photo-1502672260266?auto=format'
      ]);

      expect(res).toBe(false);
      expect(mockRemove).not.toHaveBeenCalled();
    });

    it('calls remove with only valid Supabase storage paths and deduplicates', async () => {
      mockRemove.mockResolvedValueOnce({
        data: [{ name: 'listings/photo1.webp' }, { name: 'listings/photo2.webp' }],
        error: null
      });

      const urls = [
        'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/photo1.webp',
        'https://images.unsplash.com/photo-1522708323590', // External, must be skipped
        'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/photo2.webp',
        'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/photo1.webp' // Duplicate, must be deduplicated
      ];

      const success = await deleteListingPhotos(urls);

      expect(success).toBe(true);
      expect(mockFrom).toHaveBeenCalledWith('listing-photos');
      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith([
        'listings/photo1.webp',
        'listings/photo2.webp'
      ]);
    });

    it('handles Supabase storage error gracefully without throwing', async () => {
      mockRemove.mockResolvedValueOnce({
        data: null,
        error: { message: 'Storage bucket permission denied' }
      });

      const success = await deleteListingPhotos([
        'https://mctflomqgbbvlydsvtly.supabase.co/storage/v1/object/public/listing-photos/listings/broken.webp'
      ]);

      expect(success).toBe(false);
      expect(mockRemove).toHaveBeenCalled();
    });
  });
});
