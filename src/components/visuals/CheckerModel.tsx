import { useState } from 'react';
import type { CheckerModelData, CheckerValue } from '../../types/visuals';
import BurstCalculator from './BurstCalculator';
import './visuals.css';

export interface CheckerResult {
  id: string;
  label: string;
  passed: boolean;
  requirementType: CheckerModelData['scenarios'][number]['steps'][number]['checks'][number]['requirementType'];
  evidence: string;
  actual: CheckerValue | undefined;
  expected: CheckerValue;
}

function equalValue(actual: CheckerValue | undefined, expected: CheckerValue): boolean {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

export function evaluateCheckerStep(
  step: CheckerModelData['scenarios'][number]['steps'][number],
): CheckerResult[] {
  return step.checks.map(check => {
    const actual = step.state[check.field];
    let passed = false;
    if (check.operator === 'eq') passed = equalValue(actual, check.expected);
    if (check.operator === 'neq') passed = !equalValue(actual, check.expected);
    if (check.operator === 'lte') passed = typeof actual === 'number' && typeof check.expected === 'number' && actual <= check.expected;
    if (check.operator === 'gte') passed = typeof actual === 'number' && typeof check.expected === 'number' && actual >= check.expected;
    if (check.operator === 'includes') passed = Array.isArray(actual) && typeof check.expected === 'string' && actual.includes(check.expected);
    if (check.operator === 'not-includes') passed = Array.isArray(actual) && typeof check.expected === 'string' && !actual.includes(check.expected);
    if (check.operator === 'length-eq') passed = Array.isArray(actual) && typeof check.expected === 'number' && actual.length === check.expected;
    return { ...check, passed, actual };
  });
}

function displayValue(value: CheckerValue | undefined): string {
  if (Array.isArray(value)) return value.length ? value.join(' → ') : 'empty';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return value === undefined ? 'not captured' : String(value);
}

export default function CheckerModel({ data }: { data: CheckerModelData }) {
  const [scenarioId, setScenarioId] = useState(data.scenarios[0]?.id ?? '');
  const [stepIndex, setStepIndex] = useState(0);
  const scenario = data.scenarios.find(item => item.id === scenarioId) ?? data.scenarios[0];
  const step = scenario?.steps[Math.min(stepIndex, Math.max(0, scenario.steps.length - 1))];
  const results = step ? evaluateCheckerStep(step) : [];
  const configuration = data.configurations?.find(item => item.id === scenario?.configurationId);
  const allPassed = results.every(result => result.passed);

  const selectScenario = (id: string) => {
    setScenarioId(id);
    setStepIndex(0);
  };

  if (!scenario || !step) {
    return <div className="visual-error" role="alert">Checker model has no executable scenario.</div>;
  }

  return (
    <section className="checker-model" aria-labelledby={`${data.id}-title`}>
      <div className="checker-model-heading">
        <div>
          <h2 className="visual-title" id={`${data.id}-title`}>{data.title}</h2>
          <p className="visual-description">{data.description}</p>
        </div>
        <span className="checker-scope">{data.protocolScope}</span>
      </div>

      <p className="checker-question"><strong>Learner question:</strong> {data.learnerQuestion}</p>

      <label className="checker-scenario-label" htmlFor={`${data.id}-scenario`}>Scenario</label>
      <select
        id={`${data.id}-scenario`}
        className="checker-scenario-select"
        value={scenario.id}
        onChange={event => selectScenario(event.target.value)}
      >
        {data.scenarios.map(item => <option key={item.id} value={item.id}>{item.label} · {item.mode}</option>)}
      </select>

      <div className="checker-scenario-summary">
        <span className={`checker-mode mode-${scenario.mode}`}>{scenario.mode}</span>
        <p>{scenario.description}</p>
        {configuration && <p><strong>Configuration:</strong> {configuration.label} — {configuration.description}</p>}
      </div>

      <div className="checker-stepper" aria-label="Executable scenario steps">
        {scenario.steps.map((item, index) => (
          <button
            type="button"
            key={item.id}
            className={index === stepIndex ? 'is-active' : ''}
            aria-pressed={index === stepIndex}
            onClick={() => setStepIndex(index)}
          >
            {index + 1}. {item.label}
          </button>
        ))}
      </div>

      <div className="checker-event" aria-live="polite">
        <div className="checker-event-header">
          <div><span>Executed event</span><strong>{step.event}</strong></div>
          <span className={`checker-verdict ${allPassed ? 'is-pass' : 'is-fail'}`}>{allPassed ? 'All checks pass' : 'Checker flags issue'}</span>
        </div>

        <div className="checker-state-grid">
          {Object.entries(step.state).map(([field, value]) => (
            <div key={field}><span>{field}</span><strong>{displayValue(value)}</strong></div>
          ))}
        </div>

        <ul className="checker-results" aria-label="Checker results">
          {results.map(result => (
            <li key={result.id} className={result.passed ? 'is-pass' : 'is-fail'}>
              <div><strong>{result.passed ? 'PASS' : 'FAIL'} · {result.label}</strong><span>{result.requirementType}</span></div>
              <p>{result.evidence}</p>
              <code>actual {displayValue(result.actual)} · expected {displayValue(result.expected)}</code>
            </li>
          ))}
        </ul>
      </div>

      <div className="checker-actions">
        <button type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0}>Previous event</button>
        <button type="button" onClick={() => setStepIndex(0)}>Reset model</button>
        <button type="button" onClick={() => setStepIndex(index => Math.min(scenario.steps.length - 1, index + 1))} disabled={stepIndex === scenario.steps.length - 1}>Execute next</button>
      </div>

      {data.calculator && <BurstCalculator config={data.calculator} />}

      <div className="checker-trace-scroll scroll-container" role="region" tabIndex={0} aria-label={`Scrollable traceability evidence for ${data.title}`}>
        <table className="checker-trace-table">
          <caption>Requirement-to-evidence traceability</caption>
          <thead><tr><th>Requirement</th><th>Stimulus</th><th>Checker</th><th>Coverage</th><th>Evidence</th><th>Owner / config</th><th>Review</th></tr></thead>
          <tbody>
            {data.traceability.map(row => (
              <tr key={`${row.requirement}-${row.configuration}`}>
                <th scope="row">{row.requirement}</th>
                <td>{row.stimulus}</td><td>{row.checker}</td><td>{row.coverage}</td><td>{row.evidence}</td>
                <td>{row.owner}<br />{row.configuration}</td>
                <td><strong>{row.status}</strong><br />{row.lastRegression}<br />Reviewer: {row.reviewer}{row.waiver ? <><br />Waiver: {row.waiver}</> : null}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
