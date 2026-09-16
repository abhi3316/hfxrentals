import { describe, it, expect } from 'vitest';
import { isListingOwner } from '../../src/utils/ownership';
import type { AppUser } from '../../src/types';

describe('Ownership Authorization (isListingOwner)', () => {
  const mockTenant: AppUser = {
    id: 'user-tenant-123',
    email: 'student@dal.ca',
    name: 'Dalhousie Student',
    role: 'tenant'
  };

  const mockLandlord: AppUser = {
    id: 'user-landlord-456',
    email: 'landlord@halifaxrentals.ca',
    name: 'Halifax Property Manager',
    role: 'landlord'
  };

  describe('Unauthenticated Visitors (user = null)', () => {
    it('MUST return false when user is null, regardless of listing userId', () => {
      expect(isListingOwner(null, undefined)).toBe(false);
      expect(isListingOwner(null, '')).toBe(false);
      expect(isListingOwner(null, 'local-landlord')).toBe(false);
      expect(isListingOwner(null, 'custom-12345')).toBe(false);
      expect(isListingOwner(null, 'user-tenant-123')).toBe(false);
      expect(isListingOwner(null, 'user-landlord-456')).toBe(false);
      expect(isListingOwner(null, '00000000-0000-0000-0000-000000000000')).toBe(false);
    });

    it('MUST prevent mock rentals lacking a userId from being claimed by visitors', () => {
      // Mock listings like MOCK_RENTALS might have undefined userId
      expect(isListingOwner(null, undefined)).toBe(false);
    });
  });

  describe('Authenticated Tenant / Student User', () => {
    it('returns true when listing userId strictly matches tenant user id', () => {
      expect(isListingOwner(mockTenant, 'user-tenant-123')).toBe(true);
    });

    it('returns false when listing userId belongs to another user', () => {
      expect(isListingOwner(mockTenant, 'other-user-789')).toBe(false);
    });

    it('returns false when listing userId is undefined or empty', () => {
      expect(isListingOwner(mockTenant, undefined)).toBe(false);
      expect(isListingOwner(mockTenant, '')).toBe(false);
    });

    it('returns false for local-landlord and custom-* listings if user is a tenant', () => {
      expect(isListingOwner(mockTenant, 'local-landlord')).toBe(false);
      expect(isListingOwner(mockTenant, 'custom-demo-listing')).toBe(false);
    });
  });

  describe('Authenticated Landlord User', () => {
    it('returns true when listing userId matches landlord user id', () => {
      expect(isListingOwner(mockLandlord, 'user-landlord-456')).toBe(true);
    });

    it('returns true for local demo listings (local-landlord)', () => {
      expect(isListingOwner(mockLandlord, 'local-landlord')).toBe(true);
    });

    it('returns true for custom-prefixed local demo listings (custom-*)', () => {
      expect(isListingOwner(mockLandlord, 'custom-1710000000')).toBe(true);
      expect(isListingOwner(mockLandlord, 'custom-sublet-abc')).toBe(true);
    });

    it('returns false when listing belongs to a different real user', () => {
      expect(isListingOwner(mockLandlord, 'user-tenant-123')).toBe(false);
      expect(isListingOwner(mockLandlord, 'other-landlord-999')).toBe(false);
    });

    it('returns false when listing userId is undefined', () => {
      expect(isListingOwner(mockLandlord, undefined)).toBe(false);
    });
  });
});
