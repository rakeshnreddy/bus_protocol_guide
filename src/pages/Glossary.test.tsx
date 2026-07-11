import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Glossary from './Glossary';


// Mock the loaders so we don't depend on actual markdown files during this unit test
vi.mock('../lib/loaders', () => ({
  getGlossaryEntries: vi.fn(() => [
    {
      id: 'foundations-apple',
      term: 'Apple',
      expandedForm: 'Apple Fruit',
      definition: 'A red fruit.',
      protocolScope: ['foundations'],
      relatedSignals: [],
      relatedLessons: []
    },
    {
      id: 'axi-axi-stream',
      term: 'AXI-Stream',
      expandedForm: '',
      definition: 'Streaming AXI protocol.',
      protocolScope: ['axi'],
      relatedSignals: ['TVALID', 'TREADY'],
      relatedLessons: ['lesson1']
    },
    {
      id: 'ahb-banana',
      term: 'Banana',
      expandedForm: '',
      definition: 'A yellow fruit.',
      protocolScope: ['ahb'],
      relatedSignals: [],
      relatedLessons: []
    }
  ])
}));

describe('Glossary Page', () => {
  it('renders all entries grouped alphabetically by default', () => {
    render(
      <MemoryRouter>
        <Glossary />
      </MemoryRouter>
    );

    // Check grouping headers
    expect(screen.getByText('A')).toBeDefined();
    expect(screen.getByText('B')).toBeDefined();

    // Check terms
    expect(screen.getByText('Apple')).toBeDefined();
    expect(screen.getByText('AXI-Stream')).toBeDefined();
    expect(screen.getByText('Banana')).toBeDefined();
  });

  it('filters terms correctly when clicking filter buttons', () => {
    render(
      <MemoryRouter>
        <Glossary />
      </MemoryRouter>
    );

    // Click 'axi'
    fireEvent.click(screen.getByText('AXI'));

    expect(screen.queryByText('Apple')).toBeNull(); // foundations
    expect(screen.queryByText('Banana')).toBeNull(); // ahb
    expect(screen.getByText('AXI-Stream')).toBeDefined(); // axi
  });
});
