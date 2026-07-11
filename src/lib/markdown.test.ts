import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './markdown';

describe('Markdown Parser', () => {
  it('should parse valid frontmatter and body correctly', () => {
    const raw = `---
id: "test-id"
title: "Test Title"
---

# Body
This is the body.`;

    const { attributes, body } = parseMarkdown<{ id: string, title: string }>(raw);
    expect(attributes.id).toBe('test-id');
    expect(attributes.title).toBe('Test Title');
    expect(body).toContain('This is the body.');
  });

  it('should handle malformed data gracefully without crashing', () => {
    const raw = `---
malformed
---
body`;
    const { attributes, body } = parseMarkdown<any>(raw);
    // front-matter library will return an empty object or partial if it's invalid YAML
    expect(attributes).toBeDefined();
    expect(body).toBeDefined();
  });

  it('should handle missing frontmatter completely gracefully', () => {
    const raw = `# Just body
No frontmatter here.`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toContain('No frontmatter here.');
  });

  it('should handle empty files', () => {
    const { attributes, body } = parseMarkdown<any>('');
    expect(attributes).toEqual({});
    expect(body).toBe('');
  });
});
