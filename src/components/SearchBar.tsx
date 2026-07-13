import { useState, useEffect, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SearchDocument } from '../lib/search';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchDocument[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('../lib/search').then(({ buildSearchIndex }) => {
      buildSearchIndex();
    });
  }, []);

  useEffect(() => {
    if (query.trim()) {
      import('../lib/search').then(({ search }) => {
        const hits = search(query);
        setResults(hits);
        setIsOpen(hits.length > 0);
        setSelectedIndex(-1);
      });
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (result: SearchDocument) => {
    setIsOpen(false);
    setQuery('');
    navigate(result.path);
  };

  return (
    <div className="search-bar-wrapper" ref={wrapperRef}>
      <div className="search-input-shell">
        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="search"
          className="search-input"
          placeholder="Search lessons, signals, glossary…"
          aria-label="Search academy"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="academy-search-results"
          aria-expanded={isOpen}
          aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim() && results.length > 0) setIsOpen(true); }}
        />
        <span className="search-shortcut" aria-hidden="true">/</span>
      </div>
      {isOpen && (
        <div className="search-results" id="academy-search-results" role="listbox" aria-label="Search results">
          {results.map((result, idx) => (
            <button
              type="button"
              key={result.id}
              id={`search-result-${idx}`}
              role="option"
              aria-selected={idx === selectedIndex}
              className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="search-result-marker" aria-hidden="true" />
              <div className="search-result-title">
                <span className="search-result-type">[{result.type.toUpperCase()}]</span> {result.title}
              </div>
              <div className="search-result-desc">{result.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
