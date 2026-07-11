import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import GlossaryTermInline from './GlossaryTermInline';

describe('GlossaryTermInline', () => {
  const mockTerm = {
    id: 'Apple',
    term: 'Apple',
    expandedForm: 'Apple Fruit',
    definition: 'A red fruit.',
    protocolScope: ['foundations'],
    relatedSignals: [],
    relatedLessons: []
  };

  it('renders the term text correctly', () => {
    render(
      <MemoryRouter>
        <GlossaryTermInline term={mockTerm}>Some Text</GlossaryTermInline>
      </MemoryRouter>
    );
    expect(screen.getByText('Some Text')).toBeDefined();
  });

  it('shows tooltip content', () => {
    render(
      <MemoryRouter>
        <GlossaryTermInline term={mockTerm}>Some Text</GlossaryTermInline>
      </MemoryRouter>
    );
    
    // Check that expanded form and definition are in the DOM (hidden via CSS but present)
    expect(screen.getByText('Apple Fruit')).toBeDefined();
    expect(screen.getByText('A red fruit.')).toBeDefined();
    expect(screen.getByText('View full entry ➔')).toBeDefined();
  });
});
