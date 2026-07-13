import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlossaryEntries } from '../../lib/loaders';
import type { SignalExplorerData } from '../../types/visuals';
import './visuals.css';

export default function SignalExplorer({ data }: { data: SignalExplorerData }) {
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  const glossaryEntries = getGlossaryEntries();
  const groups: Record<string, typeof data.signals> = {};

  data.signals.forEach(signal => {
    const group = signal.group ?? `${signal.role} signals`;
    if (!groups[group]) groups[group] = [];
    groups[group].push(signal);
  });

  return (
    <div className="signal-explorer-container">
      <h2 className="visual-title">{data.title}</h2>
      {data.description && <p className="visual-description">{data.description}</p>}

      <div className="signal-groups">
        {Object.entries(groups).map(([group, signals]) => (
          <section key={group} className="signal-role-group" aria-labelledby={`${data.id}-${group.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
            <h3 className="role-header" id={`${data.id}-${group.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>{group.toUpperCase()}</h3>
            <div className="signal-list">
              {signals.map(signal => {
                const isExpanded = expandedSignal === signal.name;
                const detailsId = `${data.id}-${signal.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-details`;
                const term = signal.relatedTermId
                  ? glossaryEntries.find(entry => entry.term === signal.relatedTermId)
                  : undefined;

                return (
                  <div key={signal.name} className={`signal-item ${isExpanded ? 'expanded' : ''}`}>
                    <button
                      type="button"
                      className="signal-item-header"
                      style={{ minHeight: '52px' }}
                      aria-expanded={isExpanded}
                      aria-controls={detailsId}
                      onClick={() => setExpandedSignal(isExpanded ? null : signal.name)}
                    >
                      <span className="signal-name">{signal.name}</span>
                      <span className="signal-expansion">{signal.expansion}</span>
                      <span className="expand-icon" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                    </button>

                    {isExpanded && (
                      <div className="signal-details" id={detailsId}>
                        <p>{signal.description}</p>
                        {(signal.direction || signal.sampled || signal.values?.length || signal.typicalUse || signal.verificationNote) && (
                          <dl className="signal-facts">
                            {signal.direction && <><dt>Direction</dt><dd>{signal.direction}</dd></>}
                            {signal.sampled && <><dt>Sampled</dt><dd>{signal.sampled}</dd></>}
                            {signal.values?.length && <><dt>Important values</dt><dd>{signal.values.join(' · ')}</dd></>}
                            {signal.typicalUse && <><dt>Typical use</dt><dd>{signal.typicalUse}</dd></>}
                            {signal.verificationNote && <><dt>DV watchpoint</dt><dd>{signal.verificationNote}</dd></>}
                          </dl>
                        )}
                        {signal.relatedTermId && (
                          term?.relatedLessons?.length ? (
                            <div className="signal-link">
                              <strong>Taught in: </strong>
                              {term.relatedLessons.map((lessonId, index) => (
                                <span key={lessonId}>
                                  {index > 0 && ', '}
                                  <Link to={`/lesson/${lessonId}`}>{lessonId}</Link>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div className="signal-link">Related concept: <strong>{signal.relatedTermId}</strong></div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
