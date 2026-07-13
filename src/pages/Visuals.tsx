import { useMemo, useState } from 'react';
import VisualRenderer from '../components/visuals/VisualRenderer';
import { getAllVisuals } from '../lib/visualLoaders';
import type { VisualData } from '../types/visuals';
import './Visuals.css';

type ProtocolFilter = 'all' | 'ahb' | 'axi' | 'foundations';

const protocolLabels: Record<ProtocolFilter, string> = {
  all: 'All visuals',
  ahb: 'AHB',
  axi: 'AXI',
  foundations: 'Foundations',
};

const typeLabels: Record<VisualData['type'], string> = {
  waveform: 'Waveform',
  timeline: 'Timeline',
  topology: 'Topology',
  'signal-explorer': 'Signal explorer',
  'coverage-map': 'Coverage map',
  'formal-property': 'Formal property',
  'spec-rule-explorer': 'Spec rule explorer',
};

const learningPrompts: Record<VisualData['type'], string> = {
  waveform: 'Inspect what changes at each cycle and where the protocol makes progress.',
  timeline: 'Follow phase overlap, duration, and transaction completion order.',
  topology: 'Trace the active route through masters, interconnect logic, and slaves.',
  'signal-explorer': 'Select a signal to connect its name, role, and protocol meaning.',
  'coverage-map': 'Find covered behavior, coverage holes, and intentionally illegal bins.',
  'formal-property': 'Change the scenario and observe when the protocol property passes or fails.',
  'spec-rule-explorer': 'Search protocol obligations and connect each rule to its bug signature.',
};

function getProtocol(visual: VisualData): Exclude<ProtocolFilter, 'all'> {
  if (visual.id.toLowerCase().includes('ahb')) return 'ahb';
  if (visual.id.toLowerCase().includes('axi')) return 'axi';
  return 'foundations';
}

export default function Visuals() {
  const visuals = useMemo(
    () => getAllVisuals().slice().sort((a, b) => a.title.localeCompare(b.title)),
    [],
  );
  const [protocol, setProtocol] = useState<ProtocolFilter>('all');
  const [type, setType] = useState<VisualData['type'] | 'all'>('all');
  const [query, setQuery] = useState('');
  const [openVisuals, setOpenVisuals] = useState<Set<string>>(() => new Set());

  const filteredVisuals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return visuals.filter(visual => {
      const matchesProtocol = protocol === 'all' || getProtocol(visual) === protocol;
      const matchesType = type === 'all' || visual.type === type;
      const matchesQuery = !normalizedQuery ||
        visual.title.toLowerCase().includes(normalizedQuery) ||
        visual.id.toLowerCase().includes(normalizedQuery);
      return matchesProtocol && matchesType && matchesQuery;
    });
  }, [protocol, query, type, visuals]);

  const toggleVisual = (id: string) => {
    setOpenVisuals(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="visuals-explorer" aria-labelledby="visuals-explorer-title">
      <header className="visuals-explorer-hero">
        <div>
          <p className="visuals-kicker">Interactive signal catalog</p>
          <h1 id="visuals-explorer-title">Visuals Explorer</h1>
          <p className="visuals-hero-copy">
            Read timing, trace transaction flow, and inspect verification intent across the academy’s complete visual library.
          </p>
        </div>
        <div className="visuals-count" aria-label={`${visuals.length} registered visuals`}>
          <strong>{visuals.length}</strong>
          <span>registered visuals</span>
        </div>
      </header>

      <div className="visuals-toolbar" aria-label="Visual filters">
        <div className="visuals-protocol-filters" role="group" aria-label="Filter by protocol">
          {(Object.keys(protocolLabels) as ProtocolFilter[]).map(filter => (
            <button
              key={filter}
              type="button"
              className={protocol === filter ? 'active' : ''}
              aria-pressed={protocol === filter}
              onClick={() => setProtocol(filter)}
            >
              {protocolLabels[filter]}
            </button>
          ))}
        </div>

        <div className="visuals-field-row">
          <label>
            <span>Search library</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Try HREADY, WLAST, ordering…"
            />
          </label>
          <label>
            <span>Visual type</span>
            <select value={type} onChange={event => setType(event.target.value as VisualData['type'] | 'all')}>
              <option value="all">All types</option>
              {Object.entries(typeLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="visuals-results-heading" aria-live="polite">
        <span>{filteredVisuals.length} result{filteredVisuals.length === 1 ? '' : 's'}</span>
        <span>Hover, focus, or tap inside a visual to inspect it.</span>
      </div>

      {filteredVisuals.length > 0 ? (
        <div className="visuals-catalog">
          {filteredVisuals.map((visual, index) => {
            const visualProtocol = getProtocol(visual);
            const isOpen = openVisuals.has(visual.id);
            return (
              <article className="visual-catalog-entry" key={visual.id}>
                <header className="visual-catalog-header">
                  <div className="visual-catalog-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <div className="visual-catalog-meta">
                      <span>{protocolLabels[visualProtocol]}</span>
                      <span>{typeLabels[visual.type]}</span>
                      <code>{visual.id}</code>
                    </div>
                    <h2>{visual.title}</h2>
                    <p>{learningPrompts[visual.type]}</p>
                    <button
                      type="button"
                      className="visual-preview-toggle"
                      aria-expanded={isOpen}
                      aria-controls={`preview-${visual.id}`}
                      onClick={() => toggleVisual(visual.id)}
                    >
                      {isOpen ? 'Hide interactive visual' : 'Open interactive visual'}
                    </button>
                  </div>
                </header>
                {isOpen && (
                  <div className="visual-catalog-preview" id={`preview-${visual.id}`}>
                    <VisualRenderer visualRef={{ id: visual.id, type: visual.type, dataFile: '' }} />
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="visuals-empty" role="status">
          <strong>No visuals match these filters.</strong>
          <span>Clear the search or choose a different protocol and visual type.</span>
        </div>
      )}
    </section>
  );
}
