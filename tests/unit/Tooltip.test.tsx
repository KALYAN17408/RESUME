import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Tooltip } from '@/components/ui/Tooltip';

describe('Tooltip Primitive', () => {
  it('renders child element and shows tooltip on hover', async () => {
    render(
      <Tooltip content="Helpful information" shortcut="⌘K">
        <button type="button">Trigger Button</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: /Trigger Button/i });
    expect(button).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);

    await waitFor(() => {
      const tooltip = screen.getByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent('Helpful information');
      expect(tooltip).toHaveTextContent('⌘K');
    });

    fireEvent.mouseLeave(button);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });

  it('shows tooltip on focus and hides on blur', async () => {
    render(
      <Tooltip content="Focus visible info">
        <button type="button">Focusable</button>
      </Tooltip>
    );

    const button = screen.getByRole('button', { name: /Focusable/i });
    fireEvent.focus(button);

    await waitFor(() => {
      expect(screen.getByRole('tooltip')).toHaveTextContent('Focus visible info');
    });

    fireEvent.blur(button);

    await waitFor(() => {
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    });
  });
});
