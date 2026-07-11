import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GlossaryEntry } from '../../types/content';

interface GlossaryTermInlineProps {
  term: GlossaryEntry;
  children: React.ReactNode;
}

export default function GlossaryTermInline({ term, children }: GlossaryTermInlineProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);
  const navigate = useNavigate();

  // Close tooltip if clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleMouseEnter = () => {
    // Only open on hover if we're on a non-touch device (coarse pointer implies touch)
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setIsOpen(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent default so we can control navigation
    e.preventDefault();
    
    // If it's a touch device and it's not open yet, open it first.
    // If it's already open, or if it's a desktop click, navigate to the glossary.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
    }
    
    // Navigate to glossary page anchor
    navigate(`/glossary#${term.term}`);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    // Stop propagation so the span's click handler doesn't fire
    e.stopPropagation();
    navigate(`/glossary#${term.term}`);
  };

  return (
    <span 
      className="glossary-term-inline" 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      title={term.definition} // Native fallback
    >
      <span className="term-text">{children}</span>
      
      {/* We use class toggling for JS-based state instead of relying purely on CSS :hover */}
      <span className={`glossary-tooltip ${isOpen ? 'is-open' : ''}`}>
        <strong style={{ display: 'block', marginBottom: '4px', fontSize: '1.05em' }}>
          {term.expandedForm || term.term}
        </strong>
        {term.definition}
        <span style={{ display: 'block', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', textAlign: 'right' }}>
          <span 
            className="view-full-entry-link"
            onClick={handleLinkClick}
            style={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}
          >
            View full entry ➔
          </span>
        </span>
      </span>
    </span>
  );
}
