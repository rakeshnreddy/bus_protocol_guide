/**
 * Types defining the core content model for the Bus Protocol DV Academy.
 * Based on the specifications in docs/06_CONTENT_MODEL.md.
 */

/**
 * Represents the frontmatter metadata for a Markdown lesson file.
 * This determines where it sits in the curriculum and what related
 * content it references.
 */
export interface Lesson {
  id: string;
  title: string;
  protocol: 'foundations' | 'ahb' | 'axi';
  tier: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  summary: string;
  tags: string[];
  prerequisites: string[];
  relatedLessons: string[];
  visualIds: string[];
  exerciseIds: string[];
  glossaryTerms: string[];
  checklistIds: string[];
  order: number;
}

/**
 * A lightweight reference to a visual component loaded from JSON.
 * Detailed visual schemas (Waveform, Timeline, Topology) are defined in visuals.ts
 * and will be rendered by their respective components in Phase 2.
 */
export interface VisualRef {
  id: string;
  type: 'waveform' | 'timeline' | 'topology' | 'signal-explorer' | 'coverage-map' | 'formal-property' | 'spec-rule-explorer';
  dataFile: string;
}

/**
 * Represents a term in the global glossary.
 */
export interface GlossaryEntry {
  id: string;
  term: string;
  expandedForm: string;
  definition: string;
  protocolScope: string[];
  relatedSignals: string[];
  relatedLessons: string[];
}

/**
 * Represents a self-check exercise tied to lessons.
 */
export interface Exercise {
  id: string;
  type: 'reflection' | 'multiple-choice' | 'short-answer';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prompt: string;
  expectedTakeaway: string;
  relatedLessons: string[];
  options?: string[]; // For multiple-choice
  correctOptionIndex?: number; // For multiple-choice
}

/**
 * Represents a single actionable item inside a checklist.
 */
export interface ChecklistItem {
  id: string;
  description: string;
  done: boolean;
}

/**
 * Represents a review checklist (e.g., spec review checklist, verification checklist).
 */
export interface Checklist {
  id: string;
  title: string;
  protocol: string;
  items: ChecklistItem[];
}
