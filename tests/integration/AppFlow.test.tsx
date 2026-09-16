import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

// Mock Supabase to ensure hermetic local demo execution during testing
vi.mock('../../src/lib/supabase', () => ({
  isSupabaseConfigured: false,
  supabase: null
}));

import { App } from '../../src/App';
import { AuthProvider } from '../../src/context/AuthContext';
import { MOCK_RENTALS } from '../../src/data/mockData';

describe('App End-to-End User Flow Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('Strictly prevents unauthenticated users from chatting and opens AuthModal', async () => {
    // Seed initial mock rentals so cards are present in the list
    localStorage.setItem('hfx_local_rentals', JSON.stringify(MOCK_RENTALS));

    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    // Initial load: no user is logged in
    // Find all "Chat" buttons on rental cards (title="Chat with landlord")
    const chatButtons = await screen.findAllByRole('button', { name: /Chat/i });
    expect(chatButtons.length).toBeGreaterThan(0);

    // Click chat on the first rental card
    fireEvent.click(chatButtons[0]);

    // AuthModal MUST open with welcome title
    expect(screen.getByText(/Welcome to HfxRentals/i)).toBeInTheDocument();
    expect(screen.getByText(/Sign in to access your saved viewings, favorites, and listings/i)).toBeInTheDocument();

    // ChatModal must NOT be displayed
    expect(screen.queryByPlaceholderText(/Type your message or select a prompt/i)).not.toBeInTheDocument();
  });

  it('Renders DeleteConfirmModal when an owner initiates listing deletion, allows cancelling, and completes deletion on confirm', async () => {
    // Seed an authentic custom listing owned by demo-landlord-01
    const testCustomRental = {
      ...MOCK_RENTALS[0],
      id: 'custom-rental-test-999',
      title: 'South End Victorian Flat (Test)',
      userId: 'demo-landlord-01'
    };

    localStorage.setItem('hfx_local_rentals', JSON.stringify([testCustomRental]));
    localStorage.setItem('hfxrentals_auth_user', JSON.stringify({
      id: 'demo-landlord-01',
      email: 'macleod.rentals@halifaxflats.ca',
      name: 'Robert MacLeod',
      role: 'landlord',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      hasFastPassVerified: true
    }));

    render(
      <AuthProvider>
        <App />
      </AuthProvider>
    );

    // Verify the custom listing is rendered
    expect(await screen.findByText('South End Victorian Flat (Test)')).toBeInTheDocument();

    // Verify "Your Listing" badge is displayed
    expect(await screen.findByText('Your Listing')).toBeInTheDocument();

    // Find the Delete button on the card
    const deleteBtn = await screen.findByRole('button', { name: /delete listing/i });
    expect(deleteBtn).toBeInTheDocument();

    // Click Delete button
    fireEvent.click(deleteBtn);

    // Verify DeleteConfirmModal pop-up appears
    expect(screen.getByRole('heading', { name: /Delete Listing\?/i })).toBeInTheDocument();
    expect(screen.getByText(/this action is permanent and cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText('Keep Listing')).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete Listing')).toBeInTheDocument();

    // Step 1: Click "Keep Listing" -> modal closes, listing remains
    fireEvent.click(screen.getByText('Keep Listing'));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Delete Listing\?/i })).not.toBeInTheDocument();
    });
    expect(screen.getByText('South End Victorian Flat (Test)')).toBeInTheDocument();

    // Step 2: Click Delete again, and click "Yes, Delete Listing"
    fireEvent.click(screen.getByRole('button', { name: /delete listing/i }));
    expect(screen.getByRole('heading', { name: /Delete Listing\?/i })).toBeInTheDocument();

    fireEvent.click(screen.getByText('Yes, Delete Listing'));

    // Verify modal closes and listing is permanently removed from the UI
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /Delete Listing\?/i })).not.toBeInTheDocument();
      expect(screen.queryByText('South End Victorian Flat (Test)')).not.toBeInTheDocument();
    });
  });
});
