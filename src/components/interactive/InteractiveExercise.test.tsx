import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import InteractiveExercise from './InteractiveExercise';
import type { Exercise } from '../../types/content';
import ahbCoverageExercise from '../../../content/exercises/ex-ahb-coverage-holes.json';
import axiCoverageExercise from '../../../content/exercises/ex-axi-coverage-holes.json';

const mockMultipleChoice: Exercise = {
  id: 'ex-1',
  type: 'multiple-choice',
  difficulty: 'beginner',
  prompt: 'What is 1 + 1?',
  options: ['1', '2', '3'],
  correctOptionIndex: 1,
  expectedTakeaway: 'Math is fun.',
  relatedLessons: []
};

const mockReflection: Exercise = {
  id: 'ex-2',
  type: 'reflection',
  difficulty: 'beginner',
  prompt: 'Think about why we need clocks.',
  expectedTakeaway: 'For synchronization.',
  relatedLessons: []
};

describe('InteractiveExercise', () => {
  it('renders multiple choice options and handles correct selection', () => {
    render(<InteractiveExercise exercise={mockMultipleChoice} />);
    expect(screen.getByText('What is 1 + 1?')).toBeInTheDocument();
    
    // Select correct option
    fireEvent.click(screen.getByText('2'));
    
    // Check answer
    fireEvent.click(screen.getByText('Check Answer'));
    
    // Should show correct feedback
    expect(screen.getByText('Correct!')).toBeInTheDocument();
    expect(screen.getByText('Math is fun.')).toBeInTheDocument();
  });

  it('renders multiple choice options and handles incorrect selection', () => {
    render(<InteractiveExercise exercise={mockMultipleChoice} />);
    
    // Select incorrect option
    fireEvent.click(screen.getByText('1'));
    
    // Check answer
    fireEvent.click(screen.getByText('Check Answer'));
    
    // Should show incorrect feedback
    expect(screen.getByText('Incorrect.')).toBeInTheDocument();
    expect(screen.getByText('Math is fun.')).toBeInTheDocument();
  });

  it('handles reflection exercises', () => {
    render(<InteractiveExercise exercise={mockReflection} />);
    expect(screen.getByText('Think about why we need clocks.')).toBeInTheDocument();
    
    // Reveal answer
    fireEvent.click(screen.getByText('Reveal Answer'));
    
    // Should show takeaway
    expect(screen.getByText('For synchronization.')).toBeInTheDocument();
  });

  describe('Integration with specific Phase 7.1 content', () => {
    it('renders ex-ahb-coverage-holes as a reflection exercise', () => {
      render(<InteractiveExercise exercise={ahbCoverageExercise as Exercise} />);
      expect(screen.getByText(/Identify a coverage hole in the AHB Coverage Map/i)).toBeInTheDocument();
      
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(screen.getByText(/A valid WRAP16 \+ OKAY scenario/i)).toBeInTheDocument();
    });

    it('renders ex-axi-coverage-holes as a multiple-choice exercise and handles incorrect answer', () => {
      render(<InteractiveExercise exercise={axiCoverageExercise as Exercise} />);
      expect(screen.getByText(/why is FIXED burst plus EXOKAY response not enough evidence/i)).toBeInTheDocument();
      
      // Select incorrect answer (index 1)
      fireEvent.click(screen.getByText(/Because every FIXED burst is automatically/i));
      fireEvent.click(screen.getByText('Check Answer'));
      expect(screen.getByText('Incorrect.')).toBeInTheDocument();
      expect(screen.getByText(/EXOKAY legality depends on the exclusive transaction context/i)).toBeInTheDocument();
    });

    it('renders ex-axi-coverage-holes as a multiple-choice exercise and handles correct answer', () => {
      render(<InteractiveExercise exercise={axiCoverageExercise as Exercise} />);
      
      // Select correct answer (index 0)
      fireEvent.click(screen.getByText(/Because EXOKAY depends on exclusive-request context/i));
      fireEvent.click(screen.getByText('Check Answer'));
      expect(screen.getByText('Correct!')).toBeInTheDocument();
      expect(screen.getByText(/EXOKAY legality depends on the exclusive transaction context/i)).toBeInTheDocument();
    });
  });
});
