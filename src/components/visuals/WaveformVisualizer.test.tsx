import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import WaveformVisualizer from './WaveformVisualizer';
import type { WaveformVisualData } from '../../types/visuals';

const mockData: WaveformVisualData = {
  id: 'test-wf',
  type: 'waveform',
  title: 'Test Waveform',
  cycleCount: 2,
  signals: [
    {
      name: 'CLK',
      type: 'clock',
      color: '#000000',
      values: ['1', '1']
    },
    {
      name: 'VALID',
      type: 'control',
      color: '#ff0000',
      values: ['0', '1']
    }
  ],
  annotations: [
    {
      cycle: 1,
      message: 'Valid goes high'
    }
  ],
  violations: [
    {
      cycle: 0,
      message: 'Should be high'
    }
  ]
};

describe('WaveformVisualizer', () => {
  it('renders all signals', () => {
    render(<WaveformVisualizer data={mockData} />);
    expect(screen.getByText('CLK')).toBeInTheDocument();
    expect(screen.getByText('VALID')).toBeInTheDocument();
  });

  it('renders cycle labels correctly', () => {
    render(<WaveformVisualizer data={mockData} />);
    expect(screen.getByText('C0')).toBeInTheDocument();
    expect(screen.getByText('C1')).toBeInTheDocument();
  });

  it('reveals annotation on cycle click', () => {
    const { container } = render(<WaveformVisualizer data={mockData} />);
    // Find the cycle interaction rect for cycle 1
    const interactionRects = container.querySelectorAll('.cycle-interaction-rect');
    expect(interactionRects.length).toBe(2);
    
    // Hover over cycle 1 (the first rect)
    fireEvent.mouseEnter(interactionRects[0]);
    
    // Annotation should appear in the info panel
    expect(screen.getByText('Valid goes high')).toBeInTheDocument();
  });

  it('provides at least a 44x44px hit area for touch targets', () => {
    const { container } = render(<WaveformVisualizer data={mockData} />);
    const interactionRects = container.querySelectorAll('.cycle-interaction-rect');
    
    interactionRects.forEach(rect => {
      const width = Number(rect.getAttribute('width'));
      const height = Number(rect.getAttribute('height'));
      
      expect(width).toBeGreaterThanOrEqual(44);
      expect(height).toBeGreaterThanOrEqual(44);
    });
  });
});
