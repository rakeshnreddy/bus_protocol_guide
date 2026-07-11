import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getGlossaryEntries } from '../../lib/loaders';
import type { SignalExplorerData } from '../../types/visuals';
import './visuals.css';

export default function SignalExplorer({ data }: { data: SignalExplorerData }) {
  const [expandedSignal, setExpandedSignal] = useState<string | null>(null);
  
  // Group by role
  const groups: Record<string, typeof data.signals> = {};
  data.signals.forEach(sig => {
    if (!groups[sig.role]) groups[sig.role] = [];
    groups[sig.role].push(sig);
  });
  
  return (
    <div className="signal-explorer-container">
      <h3 className="visual-title">{data.title}</h3>
      
      <div className="signal-groups">
        {Object.entries(groups).map(([role, signals]) => (
          <div key={role} className="signal-role-group">
            <h4 className="role-header">{role.toUpperCase()} SIGNALS</h4>
            <div className="signal-list">
              {signals.map(sig => (
                <div 
                  key={sig.name} 
                  className={`signal-item ${expandedSignal === sig.name ? 'expanded' : ''}`}
                  onClick={() => setExpandedSignal(expandedSignal === sig.name ? null : sig.name)}
                >
                  <div className="signal-item-header">
                    <span className="signal-name">{sig.name}</span>
                    <span className="signal-expansion">{sig.expansion}</span>
                    <span className="expand-icon">{expandedSignal === sig.name ? '▼' : '▶'}</span>
                  </div>
                  {expandedSignal === sig.name && (
                    <div className="signal-details">
                      <p>{sig.description}</p>
                      {sig.relatedTermId && (() => {
                        const glossaryEntries = getGlossaryEntries();
                        const term = glossaryEntries.find(g => g.term === sig.relatedTermId);
                        if (term && term.relatedLessons && term.relatedLessons.length > 0) {
                          return (
                            <div className="signal-link" style={{ marginTop: '0.75rem' }}>
                              <strong>Taught in: </strong>
                              {term.relatedLessons.map((lessonId, i) => (
                                <span key={lessonId}>
                                  {i > 0 && ', '}
                                  <Link to={`/lesson/${lessonId}`} style={{ color: '#2563eb', textDecoration: 'underline' }}>{lessonId}</Link>
                                </span>
                              ))}
                            </div>
                          );
                        }
                        return (
                          <div className="signal-link">
                            Related Concept: <strong>{sig.relatedTermId}</strong>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
