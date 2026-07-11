import Fuse from 'fuse.js';
import { getLessons, getGlossaryEntries } from './loaders';
import ahbSignalsData from '../../content/visuals/sig-ahb-full.json';
import axiSignalsData from '../../content/visuals/axi-signal-ref.json';
import specRulesData from '../../content/reference/spec-rules.json';

export type SearchResultType = 'lesson' | 'glossary' | 'signal' | 'spec_rule';

export interface SearchDocument {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  path: string;
  searchableText: string;
}

let fuseInstance: Fuse<SearchDocument> | null = null;

export function buildSearchIndex() {
  if (fuseInstance) return;

  const documents: SearchDocument[] = [];

  // Index Lessons
  const lessons = getLessons();
  lessons.forEach(({ lesson }) => {
    documents.push({
      id: `lesson-${lesson.id}`,
      type: 'lesson',
      title: lesson.title,
      description: lesson.summary,
      path: `/lesson/${lesson.id}`,
      searchableText: `${lesson.title} ${lesson.summary} ${(lesson.tags || []).join(' ')}`
    });
  });

  // Index Glossary
  const glossary = getGlossaryEntries();
  glossary.forEach((entry) => {
    documents.push({
      id: `glossary-${entry.term}`,
      type: 'glossary',
      title: entry.term,
      description: entry.definition,
      path: `/glossary#${entry.term}`,
      searchableText: `${entry.term} ${entry.expandedForm || ''} ${entry.definition}`
    });
  });

  // Index Signals (AHB)
  ahbSignalsData.signals.forEach((sig) => {
    documents.push({
      id: `signal-ahb-${sig.name}`,
      type: 'signal',
      title: sig.name,
      description: sig.description,
      path: `/reference/ahb-signals`,
      searchableText: `AHB ${sig.name} ${sig.expansion || ''} ${sig.description}`
    });
  });

  // Index Signals (AXI)
  axiSignalsData.signals.forEach((sig) => {
    documents.push({
      id: `signal-axi-${sig.name}`,
      type: 'signal',
      title: sig.name,
      description: sig.description,
      path: `/reference/axi-signals`,
      searchableText: `AXI ${sig.name} ${sig.expansion || ''} ${sig.description}`
    });
  });

  // Index Spec Rules
  specRulesData.rules.forEach((rule) => {
    documents.push({
      id: rule.id,
      type: 'spec_rule',
      title: `${rule.protocol.toUpperCase()} Rule: ${rule.category}`,
      description: rule.statement,
      path: `/reference/spec-rules?search=${encodeURIComponent(rule.statement)}`,
      searchableText: `${rule.protocol} ${rule.category} ${rule.statement} ${rule.bugPattern.symptom} ${rule.bugPattern.rootCause}`
    });
  });

  fuseInstance = new Fuse(documents, {
    keys: ['title', 'searchableText'],
    threshold: 0.5,
    ignoreLocation: true,
    includeScore: true
  });
}

export function search(query: string): SearchDocument[] {
  if (!fuseInstance) {
    buildSearchIndex();
  }
  if (!query.trim()) return [];
  
  const results = fuseInstance!.search(query);
  return results.map(r => r.item);
}
