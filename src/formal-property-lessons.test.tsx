import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LessonRenderer from './components/LessonRenderer';
import { getLessonById } from './lib/loaders';
import { getExerciseById } from './lib/loaders';
import InteractiveExercise from './components/interactive/InteractiveExercise';

// Note: we can test the lesson rendering and exercise interactions specifically.
describe('Formal Property Lessons Integration', () => {
  it('AHB formal properties lesson embeds FormalPropertyPlayground', () => {
    const lessonData = getLessonById('32_ahb_formal_properties');
    expect(lessonData).toBeDefined();
    
    render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonData!.lesson} body={lessonData!.body} />
      </MemoryRouter>
    );

    // Verify the playground is rendered (checking for title or specific elements)
    expect(screen.getByText('AHB Example Bounded Completion Contract')).toBeInTheDocument();
    
    // Check that we also render the setup text
    expect(screen.getByText(/Try it yourself — toggle/)).toBeInTheDocument();
  });

  it('AXI formal properties lesson embeds FormalPropertyPlayground', () => {
    const lessonData = getLessonById('37_axi_formal_property_patterns');
    expect(lessonData).toBeDefined();

    render(
      <MemoryRouter>
        <LessonRenderer lesson={lessonData!.lesson} body={lessonData!.body} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: 'AXI Safety: WLAST Exact Match' })
    ).toBeInTheDocument();
  });

  describe('Formal Property Exercises', () => {
    it('AHB bounded liveness exercise interactions work correctly', () => {
      const exercise = getExerciseById('ex-ahb-bounded-liveness');
      expect(exercise).toBeDefined();

      render(<InteractiveExercise exercise={exercise!} />);

      // It's a reflection exercise. Check prompt.
      expect(screen.getByText(/Toggle HREADY to stay low past cycle 4/)).toBeInTheDocument();
      
      // Click reveal
      const revealBtn = screen.getByRole('button', { name: /Reveal Answer/i });
      fireEvent.click(revealBtn);

      // Verify the takeaway is revealed
      expect(screen.getByText(/configured bounded-progress property evaluates to FAIL/)).toBeInTheDocument();
      expect(screen.getByText(/not by itself a universal AHB safety violation/)).toBeInTheDocument();
    });

    it('AXI WLAST exact match exercise interactions work correctly', () => {
      const exercise = getExerciseById('ex-axi-wlast-exact');
      expect(exercise).toBeDefined();

      render(<InteractiveExercise exercise={exercise!} />);

      // Check prompt
      expect(screen.getByText(/Toggle WLAST to appear one beat early/)).toBeInTheDocument();
      
      // Click reveal
      const revealBtn = screen.getByRole('button', { name: /Reveal Answer/i });
      fireEvent.click(revealBtn);

      // Verify takeaway
      expect(screen.getByText(/accepted early WLAST is a protocol violation/)).toBeInTheDocument();
      expect(screen.getByText(/does not provide early burst termination/)).toBeInTheDocument();
    });
  });
});
