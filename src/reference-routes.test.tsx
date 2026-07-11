import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AHBSignals from './pages/reference/AHBSignals';
import AXISignals from './pages/reference/AXISignals';
import BurstRules from './pages/reference/BurstRules';
import OrderingRules from './pages/reference/OrderingRules';
import SpecRules from './pages/reference/SpecRules';
import { describe, it, expect } from 'vitest';

describe('Reference Routes', () => {
  it('renders AHB Signals page', () => {
    render(<MemoryRouter><AHBSignals /></MemoryRouter>);
    expect(screen.getAllByText('AHB Signal Reference')[0]).toBeInTheDocument();
    expect(screen.getByText('HREADY')).toBeInTheDocument();
  });

  it('renders AXI Signals page', () => {
    render(<MemoryRouter><AXISignals /></MemoryRouter>);
    expect(screen.getAllByText('AXI Signal Reference')[0]).toBeInTheDocument();
    expect(screen.getByText('AWID')).toBeInTheDocument();
  });

  it('renders Burst Rules page', () => {
    render(<MemoryRouter><BurstRules /></MemoryRouter>);
    expect(screen.getByText('Burst Rules Reference')).toBeInTheDocument();
    expect(screen.getByText(/4KB Boundary Rule/)).toBeInTheDocument();
  });

  it('renders Ordering Rules page', () => {
    render(<MemoryRouter><OrderingRules /></MemoryRouter>);
    expect(screen.getByText('Ordering Rules Reference')).toBeInTheDocument();
    expect(screen.getByText(/AHB Ordering/)).toBeInTheDocument();
    expect(screen.getByText(/AXI Ordering/)).toBeInTheDocument();
  });

  it('renders Spec Rules page', () => {
    render(<MemoryRouter><SpecRules /></MemoryRouter>);
    expect(screen.getByText('Specification Rules & Bugs')).toBeInTheDocument();
  });
});
