import { useState } from 'react';
import type { DiagnosticLabExercise } from '../../types/content';
import './interactive.css';

interface DiagnosticLabProps {
  exercise: DiagnosticLabExercise;
}

export default function DiagnosticLab({ exercise }: DiagnosticLabProps) {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const answeredCount = Object.keys(selections).length;
  const allAnswered = answeredCount === exercise.diagnosisSteps.length;

  const correctCount = exercise.diagnosisSteps
    .filter(step => selections[step.id] === step.correctOptionId)
    .length;

  const updateSelection = (stepId: string, optionId: string) => {
    if (submitted) return;
    setSelections(current => ({ ...current, [stepId]: optionId }));
  };

  const resetLab = () => {
    setSelections({});
    setSubmitted(false);
  };

  const handleEvidenceKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const scroller = event.currentTarget;
    const increment = Math.max(Math.round(scroller.clientWidth * 0.75), 44);
    const maximum = Math.max(scroller.scrollWidth - scroller.clientWidth, 0);
    let nextPosition: number | undefined;

    if (event.key === 'ArrowRight') nextPosition = Math.min(scroller.scrollLeft + increment, maximum);
    if (event.key === 'ArrowLeft') nextPosition = Math.max(scroller.scrollLeft - increment, 0);
    if (event.key === 'Home') nextPosition = 0;
    if (event.key === 'End') nextPosition = maximum;
    if (nextPosition === undefined) return;

    event.preventDefault();
    scroller.scrollLeft = nextPosition;
  };

  return (
    <section className="diagnostic-lab" aria-labelledby={`${exercise.id}-title`}>
      <header className="diagnostic-lab-header">
        <div className="diagnostic-lab-meta" aria-label={`Protocol scope: ${exercise.protocolScope}`}>
          <span>Applied DV lab</span>
          <span>{exercise.protocolScope}</span>
        </div>
        <h3 id={`${exercise.id}-title`}>{exercise.title}</h3>
        <p className="diagnostic-lab-question">
          <strong>Learner question</strong>
          <span>{exercise.learnerQuestion}</span>
        </p>
        <p>{exercise.scenario}</p>
      </header>

      <p className="diagnostic-evidence-instruction" id={`${exercise.id}-evidence-instruction`}>
        Swipe horizontally, or focus the evidence and use Left/Right, Home, and End.
      </p>
      <div
        className="diagnostic-evidence-scroll scroll-container"
        role="region"
        aria-label={`Scrollable evidence for ${exercise.title}`}
        aria-describedby={`${exercise.id}-evidence-instruction`}
        tabIndex={0}
        onKeyDown={handleEvidenceKeyDown}
      >
        <table className="diagnostic-evidence-table">
          <caption>{exercise.evidence.caption}</caption>
          <thead>
            <tr>
              <th scope="col">Observation</th>
              {exercise.evidence.columns.map(column => (
                <th scope="col" key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exercise.evidence.rows.map(row => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {exercise.evidence.columns.map(column => (
                  <td key={column.key}><code>{row.values[column.key]}</code></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form
        className="diagnostic-workflow"
        onSubmit={event => {
          event.preventDefault();
          if (allAnswered) setSubmitted(true);
        }}
      >
        <div className="diagnostic-progress" role="status" aria-live="polite">
          <span>Diagnosis workflow</span>
          <span>{answeredCount} of {exercise.diagnosisSteps.length} decisions made</span>
        </div>

        {exercise.diagnosisSteps.map((step, index) => {
          const selectedOption = selections[step.id];
          const stepCorrect = selectedOption === step.correctOptionId;
          const feedbackId = `${exercise.id}-${step.id}-feedback`;

          return (
            <fieldset
              className="diagnostic-step"
              key={step.id}
              data-result={submitted ? (stepCorrect ? 'correct' : 'incorrect') : undefined}
            >
              <legend>
                <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                {step.label}
              </legend>
              <p>{step.prompt}</p>
              <div className="diagnostic-options">
                {step.options.map(option => {
                  const optionId = `${exercise.id}-${step.id}-${option.id}`;
                  const isSelected = selectedOption === option.id;
                  const isCorrect = option.id === step.correctOptionId;
                  const resultClass = submitted && isCorrect
                    ? 'correct'
                    : submitted && isSelected && !isCorrect
                      ? 'incorrect'
                      : '';

                  return (
                    <label
                      className={`diagnostic-option ${isSelected ? 'selected' : ''} ${resultClass}`.trim()}
                      htmlFor={optionId}
                      key={option.id}
                    >
                      <input
                        id={optionId}
                        type="radio"
                        name={`${exercise.id}-${step.id}`}
                        value={option.id}
                        checked={isSelected}
                        disabled={submitted}
                        aria-describedby={submitted ? feedbackId : undefined}
                        onChange={() => updateSelection(step.id, option.id)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              {submitted && (
                <p className="diagnostic-step-feedback" id={feedbackId}>
                  <strong>{stepCorrect ? 'Reasoning confirmed.' : 'Revisit this decision.'}</strong>{' '}
                  {step.explanation}
                </p>
              )}
            </fieldset>
          );
        })}

        {!submitted ? (
          <button className="exercise-btn diagnostic-submit" type="submit" disabled={!allAnswered}>
            Check diagnosis
          </button>
        ) : (
          <div
            className={`diagnostic-result ${correctCount === exercise.diagnosisSteps.length ? 'success-bg' : 'error-bg'}`}
            role="status"
            aria-live="polite"
          >
            <div>
              <strong>
                {correctCount === exercise.diagnosisSteps.length
                  ? 'Diagnosis confirmed'
                  : `${correctCount} of ${exercise.diagnosisSteps.length} decisions confirmed`}
              </strong>
              <p>{exercise.expectedTakeaway}</p>
            </div>
            <button className="exercise-btn diagnostic-reset" type="button" onClick={resetLab}>
              Try again
            </button>
          </div>
        )}
      </form>
    </section>
  );
}
