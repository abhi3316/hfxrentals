import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Supabase to ensure hermetic local test execution
vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null
}));

import { App } from '../../src/App';
import { PostListingModal } from '../../src/components/PostListingModal';
import { AuthProvider } from '../../src/context/AuthContext';

describe('Post Listing Authentication Guard Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Unauthenticated User Flows', () => {
    it('strictly intercepts Navbar "Post a Listing" and opens AuthModal', async () => {
      render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );

      // Find and click the "Post a Listing" button in the Navbar
      const postListingBtn = screen.getByRole('button', { name: /Post a Listing/i });
      expect(postListingBtn).toBeInTheDocument();

      fireEvent.click(postListingBtn);

      // AuthModal must open with sign-in prompt
      expect(await screen.findByText(/Welcome to HfxRentals/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign in to access your saved viewings, favorites, and listings/i)).toBeInTheDocument();

      // The listing wizard should NOT be open
      expect(screen.queryByText(/Post on HfxRentals/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Select Listing Category/i)).not.toBeInTheDocument();
    });

    it('intercepts Rentals empty-state "Post a Rental Listing" and opens AuthModal', async () => {
      render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );

      // In initial state without sample data, empty state button is rendered
      const emptyStatePostBtn = await screen.findByRole('button', { name: /Post a Rental Listing/i });
      expect(emptyStatePostBtn).toBeInTheDocument();

      fireEvent.click(emptyStatePostBtn);

      // AuthModal must open
      expect(await screen.findByText(/Welcome to HfxRentals/i)).toBeInTheDocument();
      expect(screen.queryByText(/Post on HfxRentals/i)).not.toBeInTheDocument();
    });

    it('intercepts Sublets empty-state "Post a Sublet" and opens AuthModal', async () => {
      render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );

      // Switch to Sublets tab
      const subletsTab = screen.getByRole('tab', { name: /Sublets/i });
      fireEvent.click(subletsTab);

      // Find "Post a Sublet" button in empty state
      const postSubletBtn = await screen.findByRole('button', { name: /Post a Sublet/i });
      expect(postSubletBtn).toBeInTheDocument();

      fireEvent.click(postSubletBtn);

      // AuthModal must open
      expect(await screen.findByText(/Welcome to HfxRentals/i)).toBeInTheDocument();
      expect(screen.queryByText(/Post on HfxRentals/i)).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User Flows', () => {
    it('allows authenticated users to open the Post Listing wizard', async () => {
      // Seed authenticated landlord session
      localStorage.setItem('hfxrentals_auth_user', JSON.stringify({
        id: 'demo-landlord-01',
        email: 'landlord@halifax.ca',
        name: 'Sarah Connor',
        role: 'landlord'
      }));

      render(
        <AuthProvider>
          <App />
        </AuthProvider>
      );

      const postListingBtn = screen.getByRole('button', { name: /Post a Listing/i });
      fireEvent.click(postListingBtn);

      // Listing wizard MUST be displayed
      expect(await screen.findByText(/Post on HfxRentals/i)).toBeInTheDocument();
      expect(screen.getByText(/What are you listing today\?/i)).toBeInTheDocument();
      expect(screen.getByText(/Full Rental/i)).toBeInTheDocument();

      // AuthModal must NOT be displayed
      expect(screen.queryByText(/Welcome to HfxRentals/i)).not.toBeInTheDocument();
    });
  });

  describe('PostListingModal Defense-in-Depth Lock Barrier', () => {
    it('renders auth lock barrier if PostListingModal is rendered without an active session', () => {
      const handleClose = vi.fn();
      const handleCreated = vi.fn();
      const handleOpenAuth = vi.fn();

      render(
        <AuthProvider>
          <PostListingModal
            onClose={handleClose}
            onListingCreated={handleCreated}
            onOpenAuth={handleOpenAuth}
          />
        </AuthProvider>
      );

      // Verify lock barrier text
      expect(screen.getByRole('heading', { name: /Sign In Required to Post/i })).toBeInTheDocument();
      expect(screen.getByText(/You must be signed in to post a rental listing, student sublet, or roommate profile on HfxRentals/i)).toBeInTheDocument();

      // Verify buttons
      const signInBtn = screen.getByRole('button', { name: /Sign In to Post/i });
      expect(signInBtn).toBeInTheDocument();

      // Click "Sign In to Post"
      fireEvent.click(signInBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(handleOpenAuth).toHaveBeenCalledTimes(1);
    });

    it('allows closing the defense-in-depth lock barrier via Cancel', () => {
      const handleClose = vi.fn();

      render(
        <AuthProvider>
          <PostListingModal
            onClose={handleClose}
            onListingCreated={vi.fn()}
          />
        </AuthProvider>
      );

      const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
