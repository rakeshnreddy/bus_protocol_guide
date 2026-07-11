import { describe, it, expect } from 'vitest';
import { getLessons, getLessonsByProtocol } from './lib/loaders';

describe('Corpus Validation', () => {
  it('should load all exactly 88 lessons successfully', () => {
    const allLessons = getLessons();
    expect(allLessons.length).toBe(88);
  });

  it('should distribute lessons across protocols exactly as expected', () => {
    const byProtocol = getLessonsByProtocol();
    expect(byProtocol['foundations'].length).toBe(6);
    expect(byProtocol['ahb'].length).toBe(38);
    expect(byProtocol['axi'].length).toBe(44);
  });

  it('should guarantee every lesson has valid and correctly typed metadata fields', () => {
    const allLessons = getLessons();
    const errors: string[] = [];
    const ids = new Set<string>();

    for (const { lesson } of allLessons) {
      // Unique ID check
      if (ids.has(lesson.id)) errors.push(`Duplicate ID: ${lesson.id}`);
      ids.add(lesson.id);

      const checkField = (field: string, type: string, isArray: boolean = false) => {
        const val = lesson[field as keyof typeof lesson];
        if (val === undefined) {
          errors.push(`[${lesson.id || 'Unknown ID'}] Missing '${field}'`);
        } else if (isArray) {
          if (!Array.isArray(val)) {
            errors.push(`[${lesson.id}] '${field}' should be an array, got ${typeof val}`);
          } else {
            val.forEach((item: any, i: number) => {
              if (typeof item !== type) {
                errors.push(`[${lesson.id}] '${field}[${i}]' should be ${type}, got ${typeof item}`);
              }
            });
          }
        } else {
          if (typeof val !== type) {
            errors.push(`[${lesson.id}] '${field}' should be ${type}, got ${typeof val}`);
          }
        }
      };

      checkField('id', 'string');
      if (typeof lesson.id === 'string' && lesson.id.length === 0) errors.push(`[${lesson.id}] Empty 'id'`);
      
      checkField('title', 'string');
      if (typeof lesson.title === 'string' && lesson.title.length === 0) errors.push(`[${lesson.id}] Empty 'title'`);
      
      checkField('summary', 'string');
      if (typeof lesson.summary === 'string' && lesson.summary.length === 0) errors.push(`[${lesson.id}] Empty 'summary'`);
      
      checkField('protocol', 'string');
      if (typeof lesson.protocol === 'string' && !['foundations', 'ahb', 'axi'].includes(lesson.protocol)) {
        errors.push(`[${lesson.id}] Invalid protocol: ${lesson.protocol}`);
      }
      
      checkField('tier', 'string');
      if (typeof lesson.tier === 'string' && lesson.tier.length === 0) errors.push(`[${lesson.id}] Empty 'tier'`);
      checkField('level', 'string');
      if (typeof lesson.level === 'string' && lesson.level.length === 0) errors.push(`[${lesson.id}] Empty 'level'`);
      
      checkField('order', 'number');
      if (typeof lesson.order === 'number' && !Number.isInteger(lesson.order)) {
        errors.push(`[${lesson.id}] 'order' must be integer`);
      }

      checkField('tags', 'string', true);
      checkField('relatedLessons', 'string', true);
      checkField('prerequisites', 'string', true);
      checkField('visualIds', 'string', true);
      checkField('exerciseIds', 'string', true);
      checkField('glossaryTerms', 'string', true);
      checkField('checklistIds', 'string', true);
    }

    if (errors.length > 0) {
      throw new Error(`Metadata validation failed with ${errors.length} errors:\n` + errors.join('\n'));
    }
  });
});
