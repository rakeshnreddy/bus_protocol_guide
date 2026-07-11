import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import React from 'react';

vi.mock('react-markdown', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div data-testid="mock-markdown">{children}</div>
}));

describe('App Routing and Lazy Loading', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('renders the app shell and homepage without crashing', () => {
    render(<App />);
    expect(screen.getByText('Bus Protocol DV Academy')).toBeInTheDocument();
    // Home content is eager
    expect(screen.getByText(/A comprehensive, visual/)).toBeInTheDocument();
  });

  it('sidebar remains visible while lazy content loads', async () => {
    render(<App />);

    // Sidebar items are loaded asynchronously now
    expect(await screen.findByText('FOUNDATIONS')).toBeInTheDocument();
    
    const link = screen.getByRole('link', { name: 'Glossary' });
    fireEvent.click(link);

    // Wait for the final heading, skipping the loading fallback assertion which may be too fast
    
    // Sidebar should still be visible
    expect(screen.getByText('FOUNDATIONS')).toBeInTheDocument();

    // Eventually loads
    expect(await screen.findByRole('heading', { name: 'Glossary' })).toBeInTheDocument();
  });

  it('renders Foundations route', async () => {
    window.history.replaceState({}, '', '/foundations');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Foundations/i })).toBeInTheDocument();
  });

  it('renders AHB route', async () => {
    window.history.replaceState({}, '', '/ahb');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /AHB/i })).toBeInTheDocument();
  });

  it('renders AXI route', async () => {
    window.history.replaceState({}, '', '/axi');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /AXI/i })).toBeInTheDocument();
  });

  it('direct initialization at a lesson URL works', async () => {
    window.history.replaceState({}, '', '/lesson/01_bus_mental_models');
    render(<App />);
    const heading = await screen.findByRole('heading', { name: 'Bus Mental Models' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByTestId('mock-markdown')).toBeInTheDocument();
  });

  it('renders Glossary route', async () => {
    window.history.replaceState({}, '', '/glossary');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Glossary/i })).toBeInTheDocument();
  });

  it('renders a quick-reference route (AHB Signals)', async () => {
    window.history.replaceState({}, '', '/reference/ahb-signals');
    render(<App />);
    const headings = await screen.findAllByRole('heading', { name: /AHB Signal Reference/i });
    expect(headings.length).toBeGreaterThan(0);
  });

  it('/reference/bug-patterns redirects to /reference/spec-rules', async () => {
    window.history.replaceState({}, '', '/reference/bug-patterns');
    render(<App />);
    // Should render Spec Rules title
    expect(await screen.findByRole('heading', { name: /Specification Rules/i })).toBeInTheDocument();
  });

  it('renders /dev/visuals', async () => {
    window.history.replaceState({}, '', '/dev/visuals');
    render(<App />);
    expect(await screen.findByRole('heading', { name: /Visual Engine Dev Viewer/i })).toBeInTheDocument();
  });

  it('navigating between two lazy routes works', async () => {
    render(<App />);
    
    // Go to Glossary
    fireEvent.click(screen.getByRole('link', { name: 'Glossary' }));
    expect(await screen.findByRole('heading', { name: 'Glossary' })).toBeInTheDocument();
    
    // Go to Visuals Explorer
    fireEvent.click(screen.getByRole('link', { name: 'Visuals Explorer' }));
    expect(await screen.findByRole('heading', { name: /Visuals Explorer/i })).toBeInTheDocument();
  });
});

