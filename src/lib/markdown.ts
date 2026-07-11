import fm from 'front-matter';

export function parseMarkdown<T>(rawContent: string): { attributes: T, body: string } {
  try {
    const parsed = fm<T>(rawContent);
    return {
      attributes: parsed.attributes,
      body: parsed.body
    };
  } catch (error) {
    console.error("Error parsing markdown", error);
    return {
      attributes: {} as T,
      body: rawContent
    };
  }
}
