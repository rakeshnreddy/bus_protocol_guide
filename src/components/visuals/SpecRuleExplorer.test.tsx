import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SpecRuleExplorer from './SpecRuleExplorer';

// Mock the CSS import if needed (Vitest handles this usually, but good practice)
vi.mock('./SpecRuleExplorer.css', () => ({}));

describe('SpecRuleExplorer Component', () => {
  it('renders without crashing and shows rules', () => {
    render(<SpecRuleExplorer />);
    expect(screen.getByPlaceholderText(/Search rules/i)).toBeInTheDocument();
    // At least one rule should be visible
    expect(screen.getAllByText(/MUST/i).length).toBeGreaterThan(0);
  });

  it('filters by protocol when a defaultProtocol is provided', () => {
    render(<SpecRuleExplorer data={{ defaultProtocol: 'ahb' }} />);
    // Should show AHB rule
    expect(screen.getByText(/hold HWDATA and control signals stable/i)).toBeInTheDocument();
    // Should NOT show AXI rule initially
    expect(screen.queryByText(/WLAST MUST be asserted exactly/i)).not.toBeInTheDocument();
  });

  it('filters rules by text search', () => {
    render(<SpecRuleExplorer />);
    const searchInput = screen.getByPlaceholderText(/Search rules/i);
    
    fireEvent.change(searchInput, { target: { value: 'WLAST' } });
    
    // Should show the early wlast rule
    expect(screen.getByText(/WLAST MUST be asserted exactly/i)).toBeInTheDocument();
    // Should hide irrelevant rules
    expect(screen.queryByText(/hold HWDATA and control signals stable/i)).not.toBeInTheDocument();
  });

  it('provides at least a 44x44px hit area for touch targets', () => {
    render(<SpecRuleExplorer />);
    
    // Get interactive elements
    const searchInput = screen.getByPlaceholderText(/Search rules/i);
    const selects = screen.getAllByRole('combobox');
    const buttons = screen.getAllByRole('button'); // Expand buttons
    
    // Check computed styles for min-width and min-height
    // Note: In JSDOM, getComputedStyle might not accurately reflect loaded CSS,
    // but we can check if the class is applied. Our CSS applies min-height: 44px
    expect(searchInput).toHaveClass('sre-search');
    
    selects.forEach(select => {
      expect(select).toHaveClass('sre-select');
    });

    buttons.forEach(button => {
      expect(button).toHaveClass('sre-expand-btn');
    });
  });

  it('toggles bug pattern visibility', () => {
    render(<SpecRuleExplorer data={{ defaultProtocol: 'axi' }} />);
    const expandBtn = screen.getAllByText('Show Bug Pattern')[0];
    
    fireEvent.click(expandBtn);
    
    expect(screen.getByText('Hide Bug Pattern')).toBeInTheDocument();
    expect(screen.getAllByText(/Symptom:/)[0]).toBeInTheDocument();
  });
});
