import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

describe('ConfirmationDialog Primitive', () => {
  it('renders correctly when open and triggers confirm callback', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    render(
      <ConfirmationDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Work Experience"
        description="Are you sure you want to remove this role?"
        confirmLabel="Delete Role"
        variant="danger"
      />
    );

    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(screen.getByText('Delete Work Experience')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to remove this role?')).toBeInTheDocument();

    const confirmBtn = screen.getByRole('button', { name: 'Delete Role' });
    fireEvent.click(confirmBtn);

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('triggers onClose when Cancel button is clicked or Escape key pressed', () => {
    const handleClose = vi.fn();
    const handleConfirm = vi.fn();

    const { rerender } = render(
      <ConfirmationDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="This will delete the item."
      />
    );

    const cancelBtn = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);

    rerender(
      <ConfirmationDialog
        isOpen={false}
        onClose={handleClose}
        onConfirm={handleConfirm}
        title="Delete Item"
        description="This will delete the item."
      />
    );

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });
});
