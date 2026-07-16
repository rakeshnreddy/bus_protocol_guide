import { parseMarkdown } from './markdown';
import type {
  Lesson,
  GlossaryEntry,
  Checklist,
  Exercise,
  ExerciseDifficulty,
  DiagnosticEvidenceColumn,
  DiagnosticEvidenceRow,
  DiagnosticStep,
} from '../types/content';

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

const exerciseDifficulties = new Set<ExerciseDifficulty>(['beginner', 'intermediate', 'advanced']);

const nonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

const stringArray = (value: unknown, fallback: string[] = []): string[] | null => {
  if (value === undefined) return fallback;
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) return null;
  return value;
};

export function normalizeExercise(raw: unknown): Exercise | null {
  if (!raw || typeof raw !== 'object') return null;
  const candidate = raw as Record<string, unknown>;
  if (!nonEmptyString(candidate.id) || !nonEmptyString(candidate.prompt)) return null;

  const expectedTakeaway = candidate.expectedTakeaway ?? candidate.explanation;
  if (!nonEmptyString(expectedTakeaway)) return null;

  const relatedLessons = stringArray(candidate.relatedLessons);
  if (!relatedLessons) return null;

  const difficulty = exerciseDifficulties.has(candidate.difficulty as ExerciseDifficulty)
    ? candidate.difficulty as ExerciseDifficulty
    : 'intermediate';
  const title = nonEmptyString(candidate.title) ? candidate.title : undefined;

  const base = {
    id: candidate.id,
    ...(title ? { title } : {}),
    difficulty,
    prompt: candidate.prompt,
    expectedTakeaway,
    relatedLessons,
  };

  if (candidate.type === 'multiple-choice') {
    const options = stringArray(candidate.options);
    if (!options || options.length < 2) return null;
    if (
      typeof candidate.correctOptionIndex !== 'number'
      || !Number.isInteger(candidate.correctOptionIndex)
      || candidate.correctOptionIndex < 0
      || candidate.correctOptionIndex >= options.length
    ) return null;

    return {
      ...base,
      type: 'multiple-choice',
      options,
      correctOptionIndex: candidate.correctOptionIndex,
    };
  }

  if (candidate.type === 'reflection' || candidate.type === 'short-answer') {
    return { ...base, type: candidate.type };
  }

  if (candidate.type !== 'diagnostic-lab') return null;
  if (
    !nonEmptyString(candidate.title)
    || !nonEmptyString(candidate.protocolScope)
    || !nonEmptyString(candidate.learnerQuestion)
    || !nonEmptyString(candidate.scenario)
    || !candidate.evidence
    || typeof candidate.evidence !== 'object'
    || !Array.isArray(candidate.diagnosisSteps)
  ) return null;

  const evidence = candidate.evidence as Record<string, unknown>;
  if (!nonEmptyString(evidence.caption) || !Array.isArray(evidence.columns) || !Array.isArray(evidence.rows)) {
    return null;
  }

  const columns: DiagnosticEvidenceColumn[] = [];
  const columnKeys = new Set<string>();
  for (const item of evidence.columns) {
    if (!item || typeof item !== 'object') return null;
    const column = item as Record<string, unknown>;
    if (!nonEmptyString(column.key) || !nonEmptyString(column.label) || columnKeys.has(column.key)) return null;
    columnKeys.add(column.key);
    columns.push({ key: column.key, label: column.label });
  }
  if (columns.length < 2) return null;

  const rows: DiagnosticEvidenceRow[] = [];
  const rowIds = new Set<string>();
  for (const item of evidence.rows) {
    if (!item || typeof item !== 'object') return null;
    const row = item as Record<string, unknown>;
    if (
      !nonEmptyString(row.id)
      || !nonEmptyString(row.label)
      || rowIds.has(row.id)
      || !row.values
      || typeof row.values !== 'object'
    ) return null;
    const values = row.values as Record<string, unknown>;
    if ([...columnKeys].some(key => !nonEmptyString(values[key]))) return null;
    rowIds.add(row.id);
    rows.push({
      id: row.id,
      label: row.label,
      values: Object.fromEntries([...columnKeys].map(key => [key, values[key] as string])),
    });
  }
  if (rows.length < 2) return null;

  const diagnosisSteps: DiagnosticStep[] = [];
  const stepIds = new Set<string>();
  for (const item of candidate.diagnosisSteps) {
    if (!item || typeof item !== 'object') return null;
    const step = item as Record<string, unknown>;
    if (
      !nonEmptyString(step.id)
      || !nonEmptyString(step.label)
      || !nonEmptyString(step.prompt)
      || !nonEmptyString(step.correctOptionId)
      || !nonEmptyString(step.explanation)
      || stepIds.has(step.id)
      || !Array.isArray(step.options)
    ) return null;

    const optionIds = new Set<string>();
    const options = step.options.flatMap(option => {
      if (!option || typeof option !== 'object') return [];
      const record = option as Record<string, unknown>;
      if (!nonEmptyString(record.id) || !nonEmptyString(record.label) || optionIds.has(record.id)) return [];
      optionIds.add(record.id);
      return [{ id: record.id, label: record.label }];
    });
    if (options.length !== step.options.length || options.length < 2 || !optionIds.has(step.correctOptionId)) {
      return null;
    }

    stepIds.add(step.id);
    diagnosisSteps.push({
      id: step.id,
      label: step.label,
      prompt: step.prompt,
      options,
      correctOptionId: step.correctOptionId,
      explanation: step.explanation,
    });
  }
  if (diagnosisSteps.length < 2) return null;

  return {
    ...base,
    type: 'diagnostic-lab',
    title: candidate.title,
    protocolScope: candidate.protocolScope,
    learnerQuestion: candidate.learnerQuestion,
    scenario: candidate.scenario,
    evidence: { caption: evidence.caption, columns, rows },
    diagnosisSteps,
  };
}

export function getExercises(): Exercise[] {
  const jsonFiles = import.meta.glob('../../content/exercises/**/*.json', { eager: true, import: 'default' });
  const exercises: Exercise[] = [];
  
  for (const path in jsonFiles) {
    const data = jsonFiles[path] as any;
    const rawExercises = Array.isArray(data) ? data : [data];
    for (const rawExercise of rawExercises) {
      const exercise = normalizeExercise(rawExercise);
      if (exercise) exercises.push(exercise);
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
