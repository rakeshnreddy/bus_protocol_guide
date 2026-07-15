import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Visuals from './Visuals';

vi.mock('../lib/visualLoaders', () => ({
  getAllVisuals: () => [
    { id: 'wf-ahb-reset', type: 'waveform', title: 'AHB Reset Sequence' },
    { id: 'wf-axi-write', type: 'waveform', title: 'AXI Write Channels' },
    { id: 'tl-abstract', type: 'timeline', title: 'Abstract Transaction' },
  ],
}));

vi.mock('../components/visuals/VisualRenderer', () => ({
  default: ({ visualRef }: { visualRef: { id: string } }) => <div data-testid={`visual-${visualRef.id}`} />,
}));

describe('Visuals Explorer', () => {
  it('renders the registered visual catalog', () => {
    render(<Visuals />);
    expect(screen.getByRole('heading', { name: 'Visuals Explorer' })).toBeInTheDocument();
    expect(screen.getByLabelText('3 registered visuals')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AHB Reset Sequence' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AXI Write Channels' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Abstract Transaction' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'AHB visual library' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'AXI visual library' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Foundations visual library' })).toBeInTheDocument();
    expect(screen.queryByTestId('visual-wf-ahb-reset')).not.toBeInTheDocument();
  });

  it('opens an interactive visual on demand', () => {
    render(<Visuals />);
    const entry = screen.getByRole('heading', { name: 'AHB Reset Sequence' }).closest('article');
    if (!entry) throw new Error('Expected AHB visual entry');
    const previewButton = within(entry).getByRole('button', { name: 'Inspect AHB Reset Sequence' });
    fireEvent.click(previewButton);

    expect(screen.getByTestId('visual-wf-ahb-reset')).toBeInTheDocument();
    expect(previewButton).toHaveAttribute('aria-expanded', 'true');
    expect(within(entry).getByRole('region', { name: 'AHB Reset Sequence interactive preview' }))
      .toBeInTheDocument();
  });

  it('filters by protocol and search query', () => {
    render(<Visuals />);
    fireEvent.click(screen.getByRole('button', { name: 'AXI' }));

    expect(screen.getByRole('heading', { name: 'AXI Write Channels' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'AHB Reset Sequence' })).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search library' }), {
      target: { value: 'no-match' },
    });
    expect(screen.getByRole('status')).toHaveTextContent('No visuals match these filters');

    fireEvent.click(screen.getByRole('button', { name: 'Reset visual filters' }));
    expect(screen.getByLabelText('3 registered visuals')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'AHB Reset Sequence' })).toBeInTheDocument();
  });

  it('filters by visual type', () => {
    render(<Visuals />);
    fireEvent.change(screen.getByLabelText('Visual type'), { target: { value: 'timeline' } });

    expect(screen.getByRole('heading', { name: 'Abstract Transaction' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'AXI Write Channels' })).not.toBeInTheDocument();
  });
});
