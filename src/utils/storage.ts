import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UploadResult {
  url: string;
  error?: string;
}

/**
 * Uploads an optimized photo to Supabase Storage (listing-photos bucket).
 * Gracefully falls back to dataUrl if Supabase Storage is not yet configured.
 */
export const uploadListingPhoto = async (
  file: File | Blob,
  fallbackDataUrl?: string
): Promise<UploadResult> => {
  // If Supabase is connected and available, upload to storage bucket
  if (isSupabaseConfigured && supabase) {
    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.webp`;
      const filePath = `listings/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('listing-photos')
        .upload(filePath, file, {
          contentType: 'image/webp',
          upsert: true
        });

      if (!uploadError) {
        const { data } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(filePath);

        if (data?.publicUrl) {
          return { url: data.publicUrl };
        }
      } else {
        console.warn('Supabase storage upload error:', uploadError.message);
      }
    } catch (err) {
      console.warn('Supabase storage upload exception:', err);
    }
  }

  // Fallback to compressed base64 / blob URL for local testing
  if (fallbackDataUrl) {
    return { url: fallbackDataUrl };
  }

  const localUrl = URL.createObjectURL(file);
  return { url: localUrl };
};

/**
 * Batch uploads multiple photos with concurrency control and progress tracking.
 */
export const uploadMultipleListingPhotos = async (
  items: { file: File | Blob; dataUrl?: string }[],
  onProgress?: (completed: number, total: number) => void
): Promise<string[]> => {
  const urls: string[] = [];
  let completed = 0;

  for (const item of items) {
    const res = await uploadListingPhoto(item.file, item.dataUrl);
    urls.push(res.url);
    completed++;
    if (onProgress) {
      onProgress(completed, items.length);
    }
  }

  return urls;
};

/**
 * Extracts clean bucket-relative file path (e.g. "listings/123.webp") from any Supabase image URL.
 */
export const extractStorageFilePath = (url: string): string | null => {
  if (!url || typeof url !== 'string') return null;

  try {
    if (url.includes('/listing-photos/')) {
      const afterBucket = url.split('/listing-photos/')[1];
      if (afterBucket) {
        const clean = afterBucket.split('?')[0].split('#')[0];
        return decodeURIComponent(clean);
      }
    }

    if (url.startsWith('listings/')) {
      const clean = url.split('?')[0].split('#')[0];
      return decodeURIComponent(clean);
    }
  } catch (e) {
    console.warn('Error parsing storage file path from URL:', url, e);
  }

  return null;
};

/**
 * Deletes photos from the Supabase Storage bucket when a listing is removed,
 * ensuring storage space is immediately reclaimed.
 */
export const deleteListingPhotos = async (imageUrls: string[]): Promise<boolean> => {
  if (!isSupabaseConfigured || !supabase || !imageUrls || imageUrls.length === 0) {
    return false;
  }

  try {
    const filePaths: string[] = [];
    for (const url of imageUrls) {
      const path = extractStorageFilePath(url);
      if (path && !filePaths.includes(path)) {
        filePaths.push(path);
      }
    }

    if (filePaths.length === 0) {
      return false;
    }

    console.log('[Storage] Removing files from listing-photos bucket:', filePaths);
    const { data, error } = await supabase.storage
      .from('listing-photos')
      .remove(filePaths);

    if (error) {
      console.warn('[Storage] Could not remove photos from Supabase Storage:', error.message);
      return false;
    }

    console.log('[Storage] Successfully purged photos from bucket:', data);
    return true;
  } catch (err) {
    console.warn('[Storage] Error deleting listing photos from storage:', err);
    return false;
  }
};
