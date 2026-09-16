import type { AppUser } from '../types';

/**
 * Determines whether the active session user is authorized to manage (edit/delete) a listing.
 * Strict rules:
 * 1. Unauthenticated visitors can NEVER own or manage any listings.
 * 2. Authenticated owners match directly by user.id === listing.userId.
 * 3. Logged-in landlords in demo mode can manage local demo listings ('local-landlord' or 'custom-*').
 */
export const isListingOwner = (user: AppUser | null, userId?: string): boolean => {
  // Unauthenticated visitors can NEVER own or manage any listings
  if (!user) return false;

  // Direct match with active user ID
  if (userId && userId === user.id) return true;

  // For logged-in landlords testing local/demo listings
  if (user.role === 'landlord' && (userId === 'local-landlord' || userId?.startsWith('custom-'))) {
    return true;
  }

  return false;
};
