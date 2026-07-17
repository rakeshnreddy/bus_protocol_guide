import { useMemo, useState } from 'react';
import VisualRenderer from '../components/visuals/VisualRenderer';
import { getAllVisuals } from '../lib/visualLoaders';
import type { VisualData } from '../types/visuals';
import './Visuals.css';

type ProtocolFilter = 'all' | 'ahb' | 'axi' | 'foundations';
type VisualProtocol = Exclude<ProtocolFilter, 'all'>;

const protocolLabels: Record<ProtocolFilter, string> = {
  all: 'All visuals',
  ahb: 'AHB',
  axi: 'AXI',
  foundations: 'Foundations',
};

const protocolDescriptions: Record<VisualProtocol, string> = {
  ahb: 'Pipelined address and data ownership, stalls, arbitration, responses, and AHB5 mechanisms.',
  axi: 'Independent channels, burst geometry, IDs, ordering, backpressure, and verification evidence.',
  foundations: 'Shared vocabulary and transaction concepts used across the protocol curriculum.',
};

const protocolOrder: VisualProtocol[] = ['ahb', 'axi', 'foundations'];

const typeLabels: Record<VisualData['type'], string> = {
  waveform: 'Waveform',
  timeline: 'Timeline',
  topology: 'Topology',
  'signal-explorer': 'Signal explorer',
  'coverage-map': 'Coverage map',
  'formal-property': 'Formal property',
  'spec-rule-explorer': 'Spec rule explorer',
  'checker-model': 'Checker model',
};

const learningPrompts: Record<VisualData['type'], string> = {
  waveform: 'Inspect what changes at each cycle and where the protocol makes progress.',
  timeline: 'Follow phase overlap, duration, and transaction completion order.',
  topology: 'Trace the active route through masters, interconnect logic, and slaves.',
  'signal-explorer': 'Select a signal to connect its name, role, and protocol meaning.',
  'coverage-map': 'Find covered behavior, coverage holes, and intentionally illegal bins.',
  'formal-property': 'Change the scenario and observe when the protocol property passes or fails.',
  'spec-rule-explorer': 'Search protocol obligations and connect each rule to its bug signature.',
  'checker-model': 'Execute bounded event sequences, inspect retained monitor state, and review evidence-linked checker results.',
};

function getProtocol(visual: VisualData): VisualProtocol {
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

  const groupedVisuals = useMemo(
    () => protocolOrder
      .map(groupProtocol => ({
        protocol: groupProtocol,
        visuals: filteredVisuals.filter(visual => getProtocol(visual) === groupProtocol),
      }))
      .filter(group => group.visuals.length > 0),
    [filteredVisuals],
  );

  const resultOrder = useMemo(
    () => new Map(filteredVisuals.map((visual, index) => [visual.id, index + 1])),
    [filteredVisuals],
  );

  const hasActiveFilters = protocol !== 'all' || type !== 'all' || query.trim().length > 0;

  const clearFilters = () => {
    setProtocol('all');
    setType('all');
    setQuery('');
  };

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
        <div className="visuals-toolbar-heading">
          <div>
            <strong>Find a visual</strong>
            <span>Filter the library without loading every interactive preview.</span>
          </div>
          {hasActiveFilters && (
            <button type="button" className="visuals-clear-filters" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
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
        <span>
          {filteredVisuals.length} result{filteredVisuals.length === 1 ? '' : 's'} across {groupedVisuals.length} protocol group{groupedVisuals.length === 1 ? '' : 's'}
        </span>
        <span>Open a preview, then use focus, Enter, Space, or touch to inspect it.</span>
      </div>

      {filteredVisuals.length > 0 ? (
        <div className="visuals-catalog">
          {groupedVisuals.map(group => (
            <section
              className={`visual-protocol-group protocol-${group.protocol}`}
              key={group.protocol}
              aria-label={`${protocolLabels[group.protocol]} visual library`}
            >
              <header className="visual-protocol-group-header">
                <div>
                  <strong>{protocolLabels[group.protocol]}</strong>
                  <p>{protocolDescriptions[group.protocol]}</p>
                </div>
                <span>{group.visuals.length} visual{group.visuals.length === 1 ? '' : 's'}</span>
              </header>
              <div className="visual-catalog-list">
                {group.visuals.map(visual => {
                  const visualProtocol = getProtocol(visual);
                  const isOpen = openVisuals.has(visual.id);
                  const resultIndex = resultOrder.get(visual.id) ?? 0;
                  return (
                    <article className="visual-catalog-entry" key={visual.id}>
                      <header className="visual-catalog-header">
                        <div className="visual-catalog-index" aria-hidden="true">{String(resultIndex).padStart(2, '0')}</div>
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
                            aria-label={isOpen ? `Close ${visual.title}` : `Inspect ${visual.title}`}
                            aria-expanded={isOpen}
                            aria-controls={`preview-${visual.id}`}
                            onClick={() => toggleVisual(visual.id)}
                          >
                            {isOpen ? 'Close visual' : 'Inspect visual'}
                          </button>
                        </div>
                      </header>
                      {isOpen && (
                        <div
                          className="visual-catalog-preview"
                          id={`preview-${visual.id}`}
                          role="region"
                          aria-label={`${visual.title} interactive preview`}
                        >
                          <VisualRenderer visualRef={{ id: visual.id, type: visual.type, dataFile: '' }} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="visuals-empty" role="status">
          <strong>No visuals match these filters.</strong>
          <span>Reset the filters to return to the complete AHB and AXI visual library.</span>
          <button type="button" onClick={clearFilters}>Reset visual filters</button>
        </div>
      )}
    </section>
  );
}
