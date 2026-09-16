import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { DeleteConfirmModal } from '../../src/components/DeleteConfirmModal';
import { MOCK_RENTALS } from '../../src/data/mockData';

describe('DeleteConfirmModal Integration Tests', () => {
  const sampleListing = {
    ...MOCK_RENTALS[0],
    id: 'rental-delete-target-1',
    title: 'Historic Hydrostone Townhouse',
    address: '5540 Young Street, Halifax, NS',
    price: 1950
  };

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={false}
        listing={sampleListing}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when listing is null', () => {
    const { container } = render(
      <DeleteConfirmModal
        isOpen={true}
        listing={null}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title, address, price, and warning when isOpen is true', () => {
    render(
      <DeleteConfirmModal
        isOpen={true}
        listing={sampleListing}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /delete listing\?/i })).toBeInTheDocument();
    expect(screen.getByText('Historic Hydrostone Townhouse')).toBeInTheDocument();
    expect(screen.getByText(/5540 young street/i)).toBeInTheDocument();
    expect(screen.getByText('$1950/mo')).toBeInTheDocument();
    expect(screen.getByText(/this action is permanent and cannot be undone/i)).toBeInTheDocument();
  });

  it('calls onClose when "Keep Listing" button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        listing={sampleListing}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    const cancelBtn = screen.getByRole('button', { name: /keep listing/i });
    fireEvent.click(cancelBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when top close button is clicked', () => {
    const onCloseMock = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        listing={sampleListing}
        onClose={onCloseMock}
        onConfirm={vi.fn()}
      />
    );

    const closeBtn = screen.getByLabelText(/close delete confirmation/i);
    fireEvent.click(closeBtn);

    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm with listing ID when "Yes, Delete Listing" is clicked', () => {
    const onConfirmMock = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        listing={sampleListing}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
      />
    );

    const confirmBtn = screen.getByRole('button', { name: /confirm delete listing/i });
    fireEvent.click(confirmBtn);

    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(onConfirmMock).toHaveBeenCalledWith('rental-delete-target-1');
  });

  it('disables buttons and shows "Deleting..." spinner when isDeleting is true', () => {
    const onConfirmMock = vi.fn();
    render(
      <DeleteConfirmModal
        isOpen={true}
        listing={sampleListing}
        onClose={vi.fn()}
        onConfirm={onConfirmMock}
        isDeleting={true}
      />
    );

    expect(screen.getByText(/deleting\.\.\./i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /confirm delete listing/i });
    expect(confirmBtn).toBeDisabled();

    // Clicking while deleting must not trigger onConfirm again
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).not.toHaveBeenCalled();
  });
});
