import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { RentalCard } from '../../src/components/RentalCard';
import { MOCK_RENTALS } from '../../src/data/mockData';
import type { RentalListing } from '../../src/types';

describe('RentalCard Integration Tests', () => {
  const sampleListing: RentalListing = {
    ...MOCK_RENTALS[0],
    id: 'rental-test-101',
    title: 'Modern South End Apartment',
    price: 1850,
    address: '1459 Robie Street, Halifax, NS',
    neighborhood: 'South End',
    bedrooms: 2,
    bathrooms: 1,
    images: ['https://images.unsplash.com/photo-1522708323590?auto=format']
  };

  const defaultProps = {
    listing: sampleListing,
    isFavorited: false,
    onToggleFavorite: vi.fn(),
    onSelectListing: vi.fn(),
    onScheduleViewing: vi.fn(),
    onOpenChat: vi.fn(),
    onEditListing: vi.fn(),
    onDeleteListing: vi.fn()
  };

  describe('Security & Ownership Enforcement: isOwner = false (Visitor / Non-owner)', () => {
    it('MUST NOT render "Your Listing" badge', () => {
      render(<RentalCard {...defaultProps} isOwner={false} />);
      expect(screen.queryByText('Your Listing')).not.toBeInTheDocument();
    });

    it('MUST NOT render the Edit button (aria-label="Edit listing")', () => {
      render(<RentalCard {...defaultProps} isOwner={false} />);
      expect(screen.queryByRole('button', { name: /edit listing/i })).not.toBeInTheDocument();
    });

    it('MUST NOT render the Delete button (aria-label="Delete listing")', () => {
      render(<RentalCard {...defaultProps} isOwner={false} />);
      expect(screen.queryByRole('button', { name: /delete listing/i })).not.toBeInTheDocument();
    });

    it('displays "Chat" button with title "Chat with landlord"', () => {
      render(<RentalCard {...defaultProps} isOwner={false} />);
      const chatBtn = screen.getByTitle('Chat with landlord');
      expect(chatBtn).toBeInTheDocument();
      expect(chatBtn).toHaveTextContent('Chat');
    });
  });

  describe('Authorized Landlord / Owner: isOwner = true', () => {
    it('MUST render "Your Listing" badge to confirm ownership', () => {
      render(<RentalCard {...defaultProps} isOwner={true} />);
      expect(screen.getByText('Your Listing')).toBeInTheDocument();
    });

    it('renders the Edit button and triggers onEditListing when clicked', () => {
      const onEditMock = vi.fn();
      render(<RentalCard {...defaultProps} isOwner={true} onEditListing={onEditMock} />);

      const editBtn = screen.getByRole('button', { name: /edit listing/i });
      expect(editBtn).toBeInTheDocument();

      fireEvent.click(editBtn);
      expect(onEditMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledWith(sampleListing);
    });

    it('renders the Delete button and triggers onDeleteListing when clicked', () => {
      const onDeleteMock = vi.fn();
      render(<RentalCard {...defaultProps} isOwner={true} onDeleteListing={onDeleteMock} />);

      const deleteBtn = screen.getByRole('button', { name: /delete listing/i });
      expect(deleteBtn).toBeInTheDocument();

      fireEvent.click(deleteBtn);
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock).toHaveBeenCalledWith('rental-test-101');
    });

    it('displays "Inquiries" button with title "View prospective tenant inquiries"', () => {
      render(<RentalCard {...defaultProps} isOwner={true} />);
      const inquiriesBtn = screen.getByTitle('View prospective tenant inquiries');
      expect(inquiriesBtn).toBeInTheDocument();
      expect(inquiriesBtn).toHaveTextContent('Inquiries');
    });
  });

  describe('User Interactions', () => {
    it('calls onToggleFavorite when heart button is clicked', () => {
      const onToggleFav = vi.fn();
      render(<RentalCard {...defaultProps} onToggleFavorite={onToggleFav} />);

      const favBtn = screen.getByRole('button', { name: /save listing/i });
      fireEvent.click(favBtn);
      expect(onToggleFav).toHaveBeenCalledWith('rental-test-101');
    });

    it('calls onScheduleViewing when schedule button is clicked', () => {
      const onSchedule = vi.fn();
      render(<RentalCard {...defaultProps} onScheduleViewing={onSchedule} />);

      const scheduleBtn = screen.getByTitle('Book a viewing synced to Google Calendar');
      fireEvent.click(scheduleBtn);
      expect(onSchedule).toHaveBeenCalledWith(sampleListing);
    });
  });
});
