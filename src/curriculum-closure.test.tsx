import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import {
  getChecklists,
  getExercises,
  getGlossaryEntries,
  getLessons,
} from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';
import BurstRules from './pages/reference/BurstRules';

const contentSources = import.meta.glob('../content/**/*.{md,json}', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function sourceEndingWith(suffix: string): string {
  const match = Object.entries(contentSources).find(([path]) => path.endsWith(suffix));
  if (!match) throw new Error(`Missing source ending with ${suffix}`);
  return match[1];
}

describe('R6 cross-curriculum closure', () => {
  it('keeps all 88 lessons and every declared content reference resolvable', () => {
    const lessons = getLessons();
    const lessonIds = new Set(lessons.map(({ lesson }) => lesson.id));
    const exercises = getExercises();
    const exerciseIds = new Set(exercises.map(exercise => exercise.id));
    const checklists = getChecklists();
    const checklistIds = new Set(checklists.map(checklist => checklist.id));
    const glossaryTerms = new Set(getGlossaryEntries().map(entry => entry.term));

    expect(lessons).toHaveLength(88);
    expect(lessons.filter(({ lesson }) => lesson.protocol === 'foundations')).toHaveLength(6);
    expect(lessons.filter(({ lesson }) => lesson.protocol === 'ahb')).toHaveLength(38);
    expect(lessons.filter(({ lesson }) => lesson.protocol === 'axi')).toHaveLength(44);
    expect(new Set(exercises.map(exercise => exercise.id)).size).toBe(exercises.length);
    expect(new Set(checklists.map(checklist => checklist.id)).size).toBe(checklists.length);

    for (const { lesson } of lessons) {
      for (const visualId of lesson.visualIds) {
        expect(getVisualById(visualId), `${lesson.id} visual ${visualId}`).toBeDefined();
      }
      for (const exerciseId of lesson.exerciseIds) {
        expect(exerciseIds.has(exerciseId), `${lesson.id} exercise ${exerciseId}`).toBe(true);
      }
      for (const checklistId of lesson.checklistIds) {
        expect(checklistIds.has(checklistId), `${lesson.id} checklist ${checklistId}`).toBe(true);
      }
      for (const relatedId of [...lesson.prerequisites, ...lesson.relatedLessons]) {
        expect(lessonIds.has(relatedId), `${lesson.id} lesson link ${relatedId}`).toBe(true);
      }
      for (const term of lesson.glossaryTerms) {
        expect(glossaryTerms.has(term), `${lesson.id} glossary term ${term}`).toBe(true);
      }
    }
  });

  it('guards the reconciled AHB and AXI semantic claims across prose and assets', () => {
    const corpus = Object.values(contentSources).join('\n');
    const ahbLite = sourceEndingWith('/lessons/ahb/22_ahb_lite_simplifications.md');
    const ahbAccess = sourceEndingWith('/lessons/ahb/09_lock_exclusive_security.md');
    const axiFiveChannels = sourceEndingWith('/lessons/axi/04_five_channel_model.md');
    const axiVariants = sourceEndingWith('/lessons/axi/27_axi3_vs_axi4_differences.md');
    const axiCoverage = sourceEndingWith('/lessons/axi/36_axi_functional_coverage.md');
    const axiGlossary = sourceEndingWith('/glossary/axi.json');

    expect(ahbLite).toMatch(/SPLIT[\s\S]*HSPLITx[\s\S]*RETRY[\s\S]*does not use `HSPLITx`/);
    expect(ahbAccess).toMatch(/bus-ownership control, not an address reservation/i);
    expect(axiFiveChannels).toMatch(/distinct signal bundles with independent handshakes/i);
    expect(axiVariants).toMatch(/WRAP bursts permit exactly 2, 4, 8, or 16 beats/);
    expect(axiCoverage).toMatch(/Revision- and type-aware bins/);
    expect(axiGlossary).toMatch(/decode\/routing region; it is not a virtual-memory page-fault rule/i);

    for (const obsolete of [
      /physical memory pages/i,
      /slave boundaries or memory pages/i,
      /five physical, separate pipes/i,
      /completely independent physical channels/i,
      /operate completely independently/i,
      /WRAP bursts are still limited to 16 beats/i,
      /First\/final byte page/i,
      /Each split stays in one page/i,
      /edge-of-page splits/i,
      /final-byte page/i,
    ]) {
      expect(corpus).not.toMatch(obsolete);
    }
  });

  it('keeps the burst reference linked to a real AHB lesson and teaches decode-based 4 KB rationale', () => {
    render(
      <MemoryRouter>
        <BurstRules />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '07_burst_and_size' })).toHaveAttribute(
      'href',
      '/lesson/07_burst_and_size',
    );
    expect(screen.getByText(/keeps one accepted burst within one decode\/routing region/i))
      .toBeInTheDocument();
    expect(screen.getByText(/not a virtual-memory page-fault rule/i)).toBeInTheDocument();
  });
});
