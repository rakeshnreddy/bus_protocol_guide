import { describe, it, expect } from 'vitest';
import { parseMarkdown } from './markdown';

describe('Markdown Parser', () => {
  it('should parse valid inline frontmatter and body correctly', () => {
    const raw = `---\n` +
      `id: "test-id"\n` +
      `order: 123\n` +
      `tags: ["a", "b"]\n` +
      `empty: []\n` +
      `---\n\n` +
      `# Body\nThis is the body.`;

    const { attributes, body } = parseMarkdown<{ id: string, order: number, tags: string[], empty: string[] }>(raw);
    expect(attributes.id).toBe('test-id');
    expect(attributes.order).toBe(123);
    expect(attributes.tags).toEqual(['a', 'b']);
    expect(attributes.empty).toEqual([]);
    expect(body).toBe('# Body\nThis is the body.');
  });

  it('should parse block arrays with unquoted identifiers', () => {
    const raw = `---\n` +
      `relatedLessons:\n` +
      `  - 02_axi_variants\n` +
      `  - another_valid-id.1\n` +
      `---\n\nBody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.relatedLessons).toEqual(['02_axi_variants', 'another_valid-id.1']);
  });

  it('should parse block arrays with quoted strings', () => {
    const raw = `---\n` +
      `titles:\n` +
      `  - "First Title"\n` +
      `  - "Second, Title"\n` +
      `---\n\nBody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.titles).toEqual(['First Title', 'Second, Title']);
  });

  it('should parse block array followed by another key', () => {
    const raw = `---\n` +
      `list:\n` +
      `  - "item"\n` +
      `next: "val"\n` +
      `---\n\nBody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.list).toEqual(['item']);
    expect(attributes.next).toBe('val');
  });

  it('should support LF and CRLF', () => {
    const raw = `---\r\n` +
      `id: "a"\r\n` +
      `---\r\n\r\nBody`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes.id).toBe('a');
    expect(body).toBe('Body');
  });

  it('should support UTF-8 BOM', () => {
    const raw = `\ufeff---\nid: "a"\n---\nBody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.id).toBe('a');
  });

  it('should handle missing frontmatter', () => {
    const raw = `# Just body\nNo frontmatter here.`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toBe('# Just body\nNo frontmatter here.');
  });

  it('should handle empty file', () => {
    const { attributes, body } = parseMarkdown<any>('');
    expect(attributes).toEqual({});
    expect(body).toBe('');
  });

  it('should handle missing closing delimiter', () => {
    const raw = `---\nid: "a"\nBody`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toBe('---\nid: "a"\nBody');
  });

  it('should reject malformed line without colon', () => {
    const raw = `---\nmalformed\n---\nbody`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toBe('body');
  });

  it('should reject unsupported boolean', () => {
    const raw = `---\nvalid: true\n---\nbody`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toBe('body');
  });

  it('should reject unsupported null', () => {
    const raw = `---\nvalid: null\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject unsupported nested array', () => {
    const raw = `---\nvalid: [["a"]]\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject duplicate keys', () => {
    const raw = `---\nkey: "a"\nkey: "b"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject duplicate block keys', () => {
    const raw = `---\nkey:\n  - "a"\nkey:\n  - "b"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should fail-closed when one field is bad', () => {
    const raw = `---\ngood: "yes"\nbad: true\nalso_good: "yes"\n---\nbody`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
    expect(body).toBe('body');
  });

  it('should preserve markdown horizontal rule in body', () => {
    const raw = `---\nid: "a"\n---\nBody\n---\nMore body`;
    const { attributes, body } = parseMarkdown<any>(raw);
    expect(attributes.id).toBe('a');
    expect(body).toBe('Body\n---\nMore body');
  });

  it('should reject orphaned block item', () => {
    const raw = `---\n  - "a"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject invalid indentation in block array', () => {
    const raw = `---\nlist:\n   - "a"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject tab indentation in block array', () => {
    const raw = `---\nlist:\n\t- "a"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject empty block item', () => {
    const raw = `---\nlist:\n  - \n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject unsafe unquoted block item', () => {
    const raw = `---\nlist:\n  - unsafe item!\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should parse strings with commas, colons, apostrophes, and hashes', () => {
    const raw = `---\n` +
      `complex: "A string with, commas, colons: and # hashes' too"\n` +
      `---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.complex).toBe("A string with, commas, colons: and # hashes' too");
  });

  it('should parse escaped double quotes in inline string', () => {
    const raw = `---\n` +
      `escaped: "A string with \\"quotes\\""\n` +
      `---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.escaped).toBe('A string with "quotes"');
  });

  it('should reject unquoted number in block array', () => {
    const raw = `---\nlist:\n  - 12345\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject floating point in inline value', () => {
    const raw = `---\nfloat: 12.34\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should reject empty block array', () => {
    const raw = `---\nlist:\nnext: "a"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes).toEqual({});
  });

  it('should allow block array immediately before closing delimiter', () => {
    const raw = `---\nlist:\n  - "a"\n---\nbody`;
    const { attributes } = parseMarkdown<any>(raw);
    expect(attributes.list).toEqual(["a"]);
  });
});
