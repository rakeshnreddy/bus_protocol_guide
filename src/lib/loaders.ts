import { parseMarkdown } from './markdown';
import type { Lesson, GlossaryEntry, Checklist, Exercise } from '../types/content';

export function getLessons(): { lesson: Lesson, body: string }[] {
  // Use eager loading to load all markdown files at build time
  const mdFiles = import.meta.glob('../../content/lessons/**/*.md', { eager: true, query: '?raw', import: 'default' });
  
  const lessons: { lesson: Lesson, body: string }[] = [];
  
  for (const path in mdFiles) {
    const rawContent = mdFiles[path] as string;
    const { attributes, body } = parseMarkdown<any>(rawContent);
    
    // Validate core fields
    if (typeof attributes.id !== 'string' || !attributes.id.trim()) continue;
    if (typeof attributes.title !== 'string' || !attributes.title.trim()) continue;
    if (typeof attributes.summary !== 'string' || !attributes.summary.trim()) continue;
    if (typeof attributes.tier !== 'string' || !attributes.tier.trim()) continue;
    if (typeof attributes.level !== 'string' || !attributes.level.trim()) continue;
    if (typeof attributes.order !== 'number' || !Number.isInteger(attributes.order)) continue;
    
    const protocol = attributes.protocol;
    if (protocol !== 'foundations' && protocol !== 'ahb' && protocol !== 'axi') continue;
    
    // Normalize and validate collection fields
    const normalizeArray = (val: any): string[] | null => {
      if (val === undefined) return [];
      if (!Array.isArray(val)) return null; // Reject
      for (const item of val) {
        if (typeof item !== 'string') return null; // Reject
      }
      return val as string[];
    };

    const tags = normalizeArray(attributes.tags);
    const prerequisites = normalizeArray(attributes.prerequisites);
    const relatedLessons = normalizeArray(attributes.relatedLessons);
    const visualIds = normalizeArray(attributes.visualIds);
    const exerciseIds = normalizeArray(attributes.exerciseIds);
    const glossaryTerms = normalizeArray(attributes.glossaryTerms);
    const checklistIds = normalizeArray(attributes.checklistIds);

    if (tags === null || prerequisites === null || relatedLessons === null || 
        visualIds === null || exerciseIds === null || glossaryTerms === null || checklistIds === null) {
      continue;
    }

    const lesson: Lesson = {
      id: attributes.id,
      title: attributes.title,
      summary: attributes.summary,
      protocol: protocol,
      tier: attributes.tier,
      level: attributes.level,
      order: attributes.order,
      tags,
      prerequisites,
      relatedLessons,
      visualIds,
      exerciseIds,
      glossaryTerms,
      checklistIds
    };
    
    lessons.push({ lesson, body });
  }
  
  return lessons;
}

export function getLessonsByProtocol(): Record<string, Lesson[]> {
  const allLessons = getLessons();
  const grouped: Record<string, Lesson[]> = {
    foundations: [],
    ahb: [],
    axi: []
  };
  
  allLessons.forEach(({ lesson }) => {
    const proto = lesson.protocol?.toLowerCase() || 'foundations';
    if (!grouped[proto]) {
      grouped[proto] = [];
    }
    grouped[proto].push(lesson);
  });
  
  // Sort each protocol bucket by the 'order' field
  for (const proto in grouped) {
    grouped[proto].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  
  return grouped;
}

export function getGlossaryEntries(): GlossaryEntry[] {
  const jsonFiles = import.meta.glob('../../content/glossary/**/*.json', { eager: true, import: 'default' });
  let entries: GlossaryEntry[] = [];
  
  for (const path in jsonFiles) {
    const data = jsonFiles[path] as any;
    const rawEntries = Array.isArray(data) ? data : [data];
    
    // Derive protocol scope from path (e.g. "../../content/glossary/ahb.json" -> "ahb")
    let defaultScope = 'foundations';
    const match = path.match(/([a-zA-Z0-9_-]+)\.json$/);
    if (match) {
      const name = match[1].toLowerCase();
      if (['foundations', 'ahb', 'axi'].includes(name)) {
        defaultScope = name;
      }
    }
    
    for (const raw of rawEntries) {
      if (typeof raw.term !== 'string' || !raw.term.trim()) continue;
      if (typeof raw.definition !== 'string' || !raw.definition.trim()) continue;
      
      const normalizeArray = (val: any): string[] | null => {
        if (val === undefined) return [];
        if (!Array.isArray(val)) return null;
        for (const item of val) {
          if (typeof item !== 'string') return null;
        }
        return val as string[];
      };
      
      let protocolScope = normalizeArray(raw.protocolScope);
      if (protocolScope === null) continue;
      if (protocolScope.length === 0) protocolScope = [defaultScope];
      
      // Validate protocol Scope
      if (!protocolScope.every(p => ['foundations', 'ahb', 'axi'].includes(p))) continue;
      
      const relatedSignals = normalizeArray(raw.relatedSignals);
      if (relatedSignals === null) continue;
      
      const relatedLessons = normalizeArray(raw.relatedLessons);
      if (relatedLessons === null) continue;
      
      let id = raw.id;
      if (typeof id !== 'string' || !id.trim()) {
        const primaryScope = protocolScope[0] || defaultScope;
        const slug = raw.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        id = `${primaryScope}-${slug}`;
      }
      
      const expandedForm = raw.expandedForm ?? raw.expansion ?? '';
      if (typeof expandedForm !== 'string') continue;
      
      const relatedTerms = normalizeArray(raw.relatedTerms);
      if (relatedTerms === null) continue;
      
      const entry: GlossaryEntry = {
        id,
        term: raw.term,
        expandedForm,
        definition: raw.definition,
        protocolScope,
        relatedSignals,
        relatedLessons,
      };
      if (relatedTerms.length > 0) {
        entry.relatedTerms = relatedTerms;
      }
      entries.push(entry);
    }
  }
  
  // Dynamically compute related lessons based on lesson.glossaryTerms
  const lessons = getLessons();
  
  entries.forEach(entry => {
    const related = new Set(entry.relatedLessons || []);
    
    lessons.forEach(({ lesson }) => {
      if (lesson.glossaryTerms?.includes(entry.term) || lesson.glossaryTerms?.includes(entry.id)) {
        related.add(lesson.id);
      }
    });
    
    entry.relatedLessons = Array.from(related).sort();
  });
  
  return entries;
}

export function getChecklists(): Checklist[] {
  const jsonFiles = import.meta.glob('../../content/checklists/**/*.json', { eager: true, import: 'default' });
  let checklists: Checklist[] = [];
  
  for (const path in jsonFiles) {
    const data = jsonFiles[path] as any;
    if (Array.isArray(data)) {
      checklists = checklists.concat(data);
    } else {
      checklists.push(data);
    }
  }
  
  return checklists;
}

export function getExercises(): Exercise[] {
  const jsonFiles = import.meta.glob('../../content/exercises/**/*.json', { eager: true, import: 'default' });
  let exercises: Exercise[] = [];
  
  for (const path in jsonFiles) {
    const data = jsonFiles[path] as any;
    if (Array.isArray(data)) {
      exercises = exercises.concat(data);
    } else {
      exercises.push(data);
    }
  }
  
  return exercises;
}

export function getChecklistById(id: string): Checklist | undefined {
  return getChecklists().find(c => c.id === id);
}

export function getExerciseById(id: string): Exercise | undefined {
  return getExercises().find(e => e.id === id);
}

export function getLessonById(id: string): { lesson: Lesson, body: string } | undefined {
  return getLessons().find(l => l.lesson.id === id);
}
