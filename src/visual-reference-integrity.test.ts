import { describe, expect, it } from 'vitest';
import { getLessons } from './lib/loaders';
import {
  getAllVisuals,
  getVisualById,
  getVisualRegistryReport,
  getVisualSourcePath,
  supportedVisualTypes,
} from './lib/visualLoaders';

const visualFiles = import.meta.glob('../content/visuals/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, { id?: unknown }>;

const getInlineVisuals = (body: string) => Array.from(
  body.matchAll(/!\[([^\]]*)\]\(visual:([^)]+)\)/g),
  match => ({ alt: match[1].trim(), id: match[2].trim() }),
);

describe('production visual registry integrity', () => {
  it('registers every valid source file once and reports clean diagnostics', () => {
    const report = getVisualRegistryReport();
    const sourceIds = Object.entries(visualFiles).map(([path, data]) => {
      expect(data.id, `${path} must have an id`).toEqual(expect.any(String));
      return data.id as string;
    });

    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(getAllVisuals()).toHaveLength(sourceIds.length);
    expect(report.totalVisuals).toBe(sourceIds.length);
    expect(report.rootLevelVisualsRecovered).toBe(35);
    expect(report.duplicateIds).toEqual([]);
    expect(report.malformedFiles).toEqual([]);
    expect(report.unsupportedFiles).toEqual([]);
    expect(Object.values(report.countByType).reduce((sum, count) => sum + count, 0))
      .toBe(report.totalVisuals);

    for (const id of sourceIds) {
      const visual = getVisualById(id);
      expect(visual, `Visual '${id}' must be registered`).toBeDefined();
      expect(getVisualSourcePath(id), `Visual '${id}' must retain its source path`).toBeDefined();
      expect(supportedVisualTypes.has(visual!.type), `Visual '${id}' must use a supported type`).toBe(true);
      expect(visual!.title.trim(), `Visual '${id}' must have a non-empty title`).not.toBe('');
    }
  });
});

describe('all-lesson visual reference integrity', () => {
  it('resolves every declared and inline visual across all 88 lessons', () => {
    const lessons = getLessons();
    const unresolvedByProtocol = { ahb: [] as string[], axi: [] as string[] };

    expect(lessons).toHaveLength(88);

    for (const { lesson, body } of lessons) {
      expect(body, `${lesson.id} must use Markdown syntax for inline visuals`)
        .not.toMatch(/<img\b[^>]*\bsrc=["']visual:/i);

      for (const visualId of lesson.visualIds) {
        const visual = getVisualById(visualId);
        if (!visual && (lesson.protocol === 'ahb' || lesson.protocol === 'axi')) {
          unresolvedByProtocol[lesson.protocol].push(`${lesson.id}:${visualId}`);
        }
        expect(visual, `${lesson.id} visualIds reference '${visualId}' must resolve`).toBeDefined();
        expect(supportedVisualTypes.has(visual!.type)).toBe(true);
        expect(visual!.title.trim()).not.toBe('');
      }

      for (const { id } of getInlineVisuals(body)) {
        const visual = getVisualById(id);
        if (!visual && (lesson.protocol === 'ahb' || lesson.protocol === 'axi')) {
          unresolvedByProtocol[lesson.protocol].push(`${lesson.id}:${id}`);
        }
        expect(visual, `${lesson.id} inline visual '${id}' must resolve`).toBeDefined();
        expect(lesson.visualIds, `${lesson.id} must declare inline visual '${id}' in visualIds`)
          .toContain(id);
      }
    }

    expect(unresolvedByProtocol.ahb, 'AHB unresolved visual references').toEqual([]);
    expect(unresolvedByProtocol.axi, 'AXI unresolved visual references').toEqual([]);
  });

  it('integrates every Batch 1 visual with a meaningful caption next to lesson prose', () => {
    const batchOne = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'ahb' && lesson.order >= 1 && lesson.order <= 9,
    );

    expect(batchOne).toHaveLength(9);
    for (const { lesson, body } of batchOne) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every Batch 2 visual with a meaningful caption next to lesson prose', () => {
    const batchTwo = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'ahb' && lesson.order >= 10 && lesson.order <= 18,
    );

    expect(batchTwo).toHaveLength(9);
    for (const { lesson, body } of batchTwo) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every Batch 3 visual with a meaningful caption next to lesson prose', () => {
    const batchThree = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'ahb' && lesson.order >= 19 && lesson.order <= 28,
    );

    expect(batchThree).toHaveLength(10);
    for (const { lesson, body } of batchThree) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every Batch 4 visual with a meaningful caption next to lesson prose', () => {
    const batchFour = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'ahb' && lesson.order >= 29 && lesson.order <= 38,
    );

    expect(batchFour).toHaveLength(10);
    for (const { lesson, body } of batchFour) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every AXI Batch 1 visual with a meaningful caption next to lesson prose', () => {
    const batchOne = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'axi' && lesson.order >= 1 && lesson.order <= 11,
    );

    expect(batchOne).toHaveLength(11);
    for (const { lesson, body } of batchOne) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every AXI Batch 2 visual with a meaningful caption next to lesson prose', () => {
    const batchTwo = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'axi' && lesson.order >= 12 && lesson.order <= 22,
    );

    expect(batchTwo).toHaveLength(11);
    for (const { lesson, body } of batchTwo) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every AXI Batch 3 visual with a meaningful caption next to lesson prose', () => {
    const batchThree = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'axi' && lesson.order >= 23 && lesson.order <= 33,
    );

    expect(batchThree).toHaveLength(11);
    for (const { lesson, body } of batchThree) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });

  it('integrates every AXI Batch 4 visual with a meaningful caption next to lesson prose', () => {
    const batchFour = getLessons().filter(({ lesson }) =>
      lesson.protocol === 'axi' && lesson.order >= 34 && lesson.order <= 44,
    );

    expect(batchFour).toHaveLength(11);
    for (const { lesson, body } of batchFour) {
      const inlineVisuals = getInlineVisuals(body);
      expect(inlineVisuals.length, `${lesson.id} must contain at least one inline visual`).toBeGreaterThan(0);

      for (const visualId of lesson.visualIds) {
        const inline = inlineVisuals.find(({ id }) => id === visualId);
        expect(inline, `${lesson.id} must render declared visual '${visualId}' inline`).toBeDefined();
        expect(inline!.alt.length, `${lesson.id}:${visualId} needs meaningful alt text`).toBeGreaterThan(12);
        expect(inline!.alt).not.toBe(visualId);
      }
    }
  });
});
