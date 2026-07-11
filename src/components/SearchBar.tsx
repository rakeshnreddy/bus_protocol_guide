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
      <input
        type="search"
        className="search-input"
        placeholder="Search lessons, signals, glossary..."
        aria-label="Search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => { if (query.trim() && results.length > 0) setIsOpen(true); }}
      />
      {isOpen && (
        <div className="search-results">
          {results.map((result, idx) => (
            <div
              key={result.id}
              className={`search-result-item ${idx === selectedIndex ? 'selected' : ''}`}
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <div className="search-result-title">
                <span className="search-result-type">[{result.type.toUpperCase()}]</span> {result.title}
              </div>
              <div className="search-result-desc">{result.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
