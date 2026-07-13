import { useState, useMemo } from 'react';
import specRulesData from '../../../content/reference/spec-rules.json';
import './SpecRuleExplorer.css';

interface SpecRuleExplorerData {
  defaultProtocol?: 'ahb' | 'axi' | 'foundations';
}

interface SpecRuleExplorerProps {
  data?: SpecRuleExplorerData;
}

export default function SpecRuleExplorer({ data }: SpecRuleExplorerProps) {
  const [protocolFilter, setProtocolFilter] = useState<string>(data?.defaultProtocol || 'all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({});

  const rules = specRulesData.rules;

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      if (protocolFilter !== 'all' && rule.protocol !== protocolFilter) return false;
      if (categoryFilter !== 'all' && rule.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && rule.severity !== severityFilter) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          rule.statement.toLowerCase().includes(query) ||
          rule.bugPattern.symptom.toLowerCase().includes(query) ||
          rule.bugPattern.rootCause.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [rules, protocolFilter, categoryFilter, severityFilter, searchQuery]);

  const toggleExpand = (id: string) => {
    setExpandedRules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = Array.from(new Set(rules.map(r => r.category))).sort();
  
  return (
    <div className="spec-rule-explorer">
      <div className="sre-filters">
        <input 
          type="text" 
          placeholder="Search rules..." 
          aria-label="Search specification rules"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sre-search"
        />
        <select 
          aria-label="Filter by protocol"
          value={protocolFilter} 
          onChange={(e) => setProtocolFilter(e.target.value)}
          className="sre-select"
        >
          <option value="all">All Protocols</option>
          <option value="ahb">AHB</option>
          <option value="axi">AXI</option>
        </select>
        <select 
          aria-label="Filter by category"
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="sre-select"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
        <select 
          aria-label="Filter by severity"
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="sre-select"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="moderate">Moderate</option>
        </select>
      </div>

      <div className="sre-results">
        {filteredRules.length === 0 ? (
          <div className="sre-empty">No rules found matching the criteria.</div>
        ) : (
          filteredRules.map((rule) => {
            const isExpanded = expandedRules[rule.id] || false;
            const detailsId = `spec-rule-${rule.id}-details`;
            return (
              <div key={rule.id} className={`sre-card severity-${rule.severity}`}>
                <div className="sre-card-header">
                  <div className="sre-card-tags">
                    <span className="sre-tag protocol">{rule.protocol.toUpperCase()}</span>
                    <span className="sre-tag category">{rule.category.replace('_', ' ')}</span>
                    <span className={`sre-tag severity ${rule.severity}`}>{rule.severity}</span>
                  </div>
                  <div className="sre-statement">{rule.statement}</div>
                  <button
                    type="button"
                    className="sre-expand-btn"
                    aria-expanded={isExpanded}
                    aria-controls={detailsId}
                    onClick={() => toggleExpand(rule.id)}
                  >
                    {isExpanded ? 'Hide Bug Pattern' : 'Show Bug Pattern'}
                  </button>
                </div>
                {isExpanded && (
                  <div className="sre-card-body" id={detailsId}>
                    <div className="sre-bug-section">
                      <strong>Symptom:</strong> {rule.bugPattern.symptom}
                    </div>
                    <div className="sre-bug-section">
                      <strong>Root Cause:</strong> {rule.bugPattern.rootCause}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
