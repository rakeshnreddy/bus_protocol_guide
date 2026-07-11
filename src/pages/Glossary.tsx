import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { getGlossaryEntries } from '../lib/loaders';
import type { GlossaryEntry } from '../types/content';
import './Glossary.css';

export default function Glossary() {
  const [filter, setFilter] = useState<'all' | 'foundations' | 'ahb' | 'axi'>('all');
  const location = useLocation();

  const allEntries = useMemo(() => {
    return getGlossaryEntries().sort((a, b) => a.term.localeCompare(b.term));
  }, []);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return allEntries;
    return allEntries.filter(entry => entry.protocolScope.includes(filter));
  }, [allEntries, filter]);

  // Group by first letter
  const groupedEntries = useMemo(() => {
    const groups = new Map<string, GlossaryEntry[]>();
    filteredEntries.forEach(entry => {
      const letter = entry.term.charAt(0).toUpperCase();
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter)!.push(entry);
    });
    return groups;
  }, [filteredEntries]);

  // Scroll to hash on load or when hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location.hash, filteredEntries]); // Re-run if we filter and the item appears

  return (
    <div className="glossary-page">
      <header className="glossary-header">
        <h1>Glossary</h1>
        <p>Comprehensive dictionary of bus protocol terms, signals, and concepts.</p>
        
        <div className="glossary-filters">
          <button 
            className={`glossary-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Terms
          </button>
          <button 
            className={`glossary-filter-btn ${filter === 'foundations' ? 'active' : ''}`}
            onClick={() => setFilter('foundations')}
          >
            Foundations
          </button>
          <button 
            className={`glossary-filter-btn ${filter === 'ahb' ? 'active' : ''}`}
            onClick={() => setFilter('ahb')}
          >
            AHB
          </button>
          <button 
            className={`glossary-filter-btn ${filter === 'axi' ? 'active' : ''}`}
            onClick={() => setFilter('axi')}
          >
            AXI
          </button>
        </div>
      </header>

      {groupedEntries.size === 0 ? (
        <div className="no-results">No glossary terms found for this filter.</div>
      ) : (
        <div className="glossary-list">
          {Array.from(groupedEntries.keys()).sort().map(letter => (
            <div key={letter} className="glossary-group">
              <h2 className="glossary-letter">{letter}</h2>
              {groupedEntries.get(letter)!.map(entry => (
                <div key={entry.term} id={entry.term} className="glossary-term-card">
                  <div className="glossary-term-header">
                    <h3 className="glossary-term-title">{entry.term}</h3>
                    {entry.expandedForm && (
                      <span className="glossary-expanded-form">({entry.expandedForm})</span>
                    )}
                  </div>
                  <div className="glossary-definition">{entry.definition}</div>
                  
                  <div className="glossary-meta">
                    <div className="glossary-meta-item">
                      <span className="glossary-meta-label">Scope:</span>
                      <div className="glossary-tags">
                        {entry.protocolScope.map(scope => (
                          <span key={scope} className="glossary-tag">{scope}</span>
                        ))}
                      </div>
                    </div>
                    
                    {entry.relatedSignals && entry.relatedSignals.length > 0 && (
                      <div className="glossary-meta-item">
                        <span className="glossary-meta-label">Signals:</span>
                        <span>{entry.relatedSignals.join(', ')}</span>
                      </div>
                    )}

                    {entry.relatedLessons && entry.relatedLessons.length > 0 && (
                      <div className="glossary-meta-item">
                        <span className="glossary-meta-label">Used In:</span>
                        <div className="glossary-tags" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                          {entry.relatedLessons.map(lessonId => (
                            <Link key={lessonId} to={`/lesson/${lessonId}`} className="glossary-related-link">
                              {lessonId.replace('.md', '')}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
