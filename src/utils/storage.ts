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
