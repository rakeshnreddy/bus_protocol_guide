import { useState } from 'react';
import type { Exercise } from '../../types/content';
import DiagnosticLab from './DiagnosticLab';
import './interactive.css';

export default function InteractiveExercise({ exercise }: { exercise: Exercise }) {
  const [revealed, setRevealed] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  if (exercise.type === 'diagnostic-lab') {
    return <DiagnosticLab exercise={exercise} />;
  }

  if (exercise.type === 'multiple-choice') {
    return (
      <div className="exercise-container">
        <h3 className="exercise-prompt">{exercise.prompt}</h3>
        <div className="exercise-options">
          {exercise.options?.map((opt, i) => {
            const isSelected = selectedOption === i;
            const isCorrect = i === exercise.correctOptionIndex;
            let statusClass = '';
            
            if (revealed) {
              if (isCorrect) statusClass = 'correct';
              else if (isSelected) statusClass = 'incorrect';
            }

            return (
              <label key={i} className={`exercise-option ${isSelected ? 'selected' : ''} ${statusClass}`}>
                <input 
                  type="radio" 
                  name={`ex-${exercise.id}`} 
                  checked={isSelected}
                  onChange={() => setSelectedOption(i)} 
                  disabled={revealed} 
                />
                <span className="option-text">{opt}</span>
              </label>
            );
          })}
        </div>
        
        {!revealed ? (
          <button 
            className="exercise-btn"
            onClick={() => setRevealed(true)} 
            disabled={selectedOption === null}
          >
            Check Answer
          </button>
        ) : (
          <div className={`exercise-explanation ${selectedOption === exercise.correctOptionIndex ? 'success-bg' : 'error-bg'}`}>
            <p><strong>{selectedOption === exercise.correctOptionIndex ? 'Correct!' : 'Incorrect.'}</strong></p>
            <p>{exercise.expectedTakeaway}</p>
          </div>
        )}
      </div>
    );
  }

  // default to reveal type
  return (
    <div className="exercise-container">
      <h3 className="exercise-prompt">{exercise.prompt}</h3>
      {!revealed ? (
        <button className="exercise-btn" onClick={() => setRevealed(true)}>Reveal Answer</button>
      ) : (
        <div className="exercise-explanation success-bg">
          {exercise.expectedTakeaway}
        </div>
      )}
    </div>
  );
}
