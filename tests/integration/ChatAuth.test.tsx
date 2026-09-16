import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ChatModal } from '../../src/components/ChatModal';
import { MOCK_RENTALS } from '../../src/data/mockData';
import * as AuthContext from '../../src/context/AuthContext';

vi.mock('../../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Chat Authentication Barrier (ChatModal)', () => {
  const sampleListing = {
    ...MOCK_RENTALS[0],
    id: 'rental-chat-auth-1',
    title: 'Sunny South End Flat'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated User (user = null)', () => {
    beforeEach(() => {
      (AuthContext.useAuth as any).mockReturnValue({
        user: null,
        loading: false
      });
    });

    it('MUST render the Sign In Required barrier dialog instead of conversation messages', () => {
      render(
        <ChatModal
          listing={sampleListing}
          onClose={vi.fn()}
        />
      );

      expect(screen.getByRole('heading', { name: /sign in required to chat/i })).toBeInTheDocument();
      expect(screen.getByText(/you must be signed in to chat with property owners/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in to chat/i })).toBeInTheDocument();

      // Ensure private message input and send buttons are NOT rendered
      expect(screen.queryByPlaceholderText(/type your message/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /send/i })).not.toBeInTheDocument();
    });

    it('calls onOpenAuth when clicking "Sign In to Chat"', () => {
      const onOpenAuthMock = vi.fn();
      const onCloseMock = vi.fn();

      render(
        <ChatModal
          listing={sampleListing}
          onClose={onCloseMock}
          onOpenAuth={onOpenAuthMock}
        />
      );

      const signInBtn = screen.getByRole('button', { name: /sign in to chat/i });
      fireEvent.click(signInBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onOpenAuthMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('Authenticated User (user logged in)', () => {
    beforeEach(() => {
      (AuthContext.useAuth as any).mockReturnValue({
        user: {
          id: 'user-auth-tenant-1',
          name: 'Sarah Chen (Dal Student)',
          email: 'sarah@dal.ca',
          role: 'student'
        },
        loading: false
      });
    });

    it('renders active chat interface with message input and quick prompts', () => {
      render(
        <ChatModal
          listing={sampleListing}
          onClose={vi.fn()}
        />
      );

      expect(screen.queryByText(/sign in required to chat/i)).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/message .* privately/i)).toBeInTheDocument();
      expect(screen.getByText(/is heat & hot water included in rent\?/i)).toBeInTheDocument();
    });
  });
});
