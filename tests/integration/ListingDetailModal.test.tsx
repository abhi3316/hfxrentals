import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ListingDetailModal } from '../../src/components/ListingDetailModal';
import { MOCK_RENTALS, MOCK_SUBLETS } from '../../src/data/mockData';

describe('ListingDetailModal Integration Tests', () => {
  const sampleRental = {
    ...MOCK_RENTALS[0],
    id: 'rental-modal-101',
    title: 'Luxury South End Loft',
    price: 2200,
    address: '1000 Barrington Street, Halifax, NS'
  };

  const sampleSublet = {
    ...MOCK_SUBLETS[0],
    id: 'sublet-modal-202',
    title: 'Summer Sublet near Dal',
    monthlyPrice: 950
  };

  const defaultProps = {
    listing: sampleRental,
    onClose: vi.fn(),
    onOpenScamShield: vi.fn(),
    onOpenViewingScheduler: vi.fn(),
    onOpenChat: vi.fn(),
    onEditListing: vi.fn(),
    onDeleteListing: vi.fn()
  };

  describe('Visitor / Non-Owner Mode (isOwner = false)', () => {
    it('does NOT render the Edit or Delete listing action buttons', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={false} />);

      expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    });

    it('renders "Chat with Landlord" button for rentals', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={false} />);

      const chatBtn = screen.getByText(/chat with landlord/i);
      expect(chatBtn).toBeInTheDocument();
    });

    it('renders "Chat with Lister" button for sublets', () => {
      render(<ListingDetailModal {...defaultProps} listing={sampleSublet} isOwner={false} />);

      const chatBtn = screen.getByText(/chat with lister/i);
      expect(chatBtn).toBeInTheDocument();
    });

    it('renders the "Schedule Viewing" button', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={false} />);

      const scheduleBtn = screen.getByText(/schedule viewing/i);
      expect(scheduleBtn).toBeInTheDocument();
    });

    it('does not render the "Your Profile" badge', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={false} />);

      expect(screen.queryByText('Your Profile')).not.toBeInTheDocument();
    });
  });

  describe('Owner Mode (isOwner = true)', () => {
    it('renders the "View Prospective Inquiries" button instead of "Chat with Landlord"', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={true} />);

      expect(screen.getByText('View Prospective Inquiries')).toBeInTheDocument();
      expect(screen.queryByText(/chat with landlord/i)).not.toBeInTheDocument();
    });

    it('renders the Edit and Delete buttons in the action panel', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={true} />);

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('triggers onClose and onDeleteListing when Delete is clicked', () => {
      const onCloseMock = vi.fn();
      const onDeleteMock = vi.fn();

      render(
        <ListingDetailModal
          {...defaultProps}
          onClose={onCloseMock}
          onDeleteListing={onDeleteMock}
          isOwner={true}
        />
      );

      const deleteBtn = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock).toHaveBeenCalledTimes(1);
      expect(onDeleteMock).toHaveBeenCalledWith('rental-modal-101');
    });

    it('triggers onClose and onEditListing when Edit is clicked', () => {
      const onCloseMock = vi.fn();
      const onEditMock = vi.fn();

      render(
        <ListingDetailModal
          {...defaultProps}
          onClose={onCloseMock}
          onEditListing={onEditMock}
          isOwner={true}
        />
      );

      const editBtn = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledTimes(1);
      expect(onEditMock).toHaveBeenCalledWith(sampleRental);
    });

    it('renders the "Your Profile" badge next to lister profile', () => {
      render(<ListingDetailModal {...defaultProps} isOwner={true} />);

      expect(screen.getByText('Your Profile')).toBeInTheDocument();
    });
  });

  describe('Modal Dismissal & Navigation', () => {
    it('calls onClose when close button is clicked', () => {
      const onCloseMock = vi.fn();
      render(<ListingDetailModal {...defaultProps} onClose={onCloseMock} />);

      const closeBtn = screen.getByLabelText('Close modal');
      fireEvent.click(closeBtn);

      expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
  });
});
