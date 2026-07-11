import { parseMarkdown } from './markdown';
import type { Lesson, GlossaryEntry, Checklist, Exercise } from '../types/content';

export function getLessons(): { lesson: Lesson, body: string }[] {
  // Use eager loading to load all markdown files at build time
  const mdFiles = import.meta.glob('../../content/lessons/**/*.md', { eager: true, query: '?raw', import: 'default' });
  
  const lessons: { lesson: Lesson, body: string }[] = [];
  
  for (const path in mdFiles) {
    const rawContent = mdFiles[path] as string;
    const { attributes, body } = parseMarkdown<Lesson>(rawContent);
    // Ensure basic required fields exist to prevent runtime crashes on bad frontmatter
    if (attributes && attributes.id && attributes.title) {
       lessons.push({ lesson: attributes, body });
    }
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
    if (Array.isArray(data)) {
      entries = entries.concat(data);
    } else {
      entries.push(data);
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
