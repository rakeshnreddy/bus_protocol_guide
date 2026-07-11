export function parseMarkdown<T>(rawContent: string): { attributes: T, body: string } {
  const pattern = /^(?:\ufeff?)(---)([\s\S]*?)^(?:\1)\s*$(?:\r?(?:\n)?)/m;
  const match = pattern.exec(rawContent);

  if (!match) {
    return { attributes: {} as T, body: rawContent };
  }

  const fmText = match[2];
  const bodyText = rawContent.slice(match[0].length);
  const lines = fmText.split(/\r?\n/);
  const attributes: Record<string, any> = {};

  let currentBlockKey: string | null = null;
  let currentBlockItems: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    if (rawLine.trim() === '') continue;

    if (rawLine.includes('\t')) {
      return { attributes: {} as T, body: bodyText };
    }

    // Is it an indented sequence item?
    if (rawLine.startsWith(' ')) {
      if (!currentBlockKey) return { attributes: {} as T, body: bodyText };
      if (!rawLine.startsWith('  - ')) return { attributes: {} as T, body: bodyText };

      const itemText = rawLine.slice(4).trim();
      if (!itemText) return { attributes: {} as T, body: bodyText };

      let parsedItem: string;
      if (itemText.startsWith('"') && itemText.endsWith('"')) {
        try {
          const str = JSON.parse(itemText);
          if (typeof str !== 'string') return { attributes: {} as T, body: bodyText };
          parsedItem = str;
        } catch {
          return { attributes: {} as T, body: bodyText };
        }
      } else {
        if (!/^[A-Za-z0-9_./-]+$/.test(itemText)) return { attributes: {} as T, body: bodyText };
        if (/^\d+$/.test(itemText)) return { attributes: {} as T, body: bodyText };
        if (itemText === 'true' || itemText === 'false' || itemText === 'null') return { attributes: {} as T, body: bodyText };
        parsedItem = itemText;
      }

      currentBlockItems.push(parsedItem);
      continue;
    }

    // Top level key
    if (currentBlockKey) {
      if (currentBlockItems.length === 0) return { attributes: {} as T, body: bodyText };
      attributes[currentBlockKey] = currentBlockItems;
      currentBlockKey = null;
      currentBlockItems = [];
    }

    const colonIdx = rawLine.indexOf(':');
    if (colonIdx === -1) {
      return { attributes: {} as T, body: bodyText };
    }

    const key = rawLine.slice(0, colonIdx).trim();
    if (!key) return { attributes: {} as T, body: bodyText };
    if (attributes.hasOwnProperty(key)) {
      return { attributes: {} as T, body: bodyText };
    }

    const val = rawLine.slice(colonIdx + 1).trim();
    if (val === '') {
      currentBlockKey = key;
      continue;
    }

    if (val === '[]') {
      attributes[key] = [];
    } else if (val.startsWith('["') && val.endsWith('"]')) {
      try {
        const arr = JSON.parse(val);
        if (!Array.isArray(arr)) return { attributes: {} as T, body: bodyText };
        for (const item of arr) {
          if (typeof item !== 'string') return { attributes: {} as T, body: bodyText };
        }
        attributes[key] = arr;
      } catch (e) {
        return { attributes: {} as T, body: bodyText };
      }
    } else if (val.startsWith('"') && val.endsWith('"')) {
      try {
        const str = JSON.parse(val);
        if (typeof str !== 'string') return { attributes: {} as T, body: bodyText };
        attributes[key] = str;
      } catch (e) {
        return { attributes: {} as T, body: bodyText };
      }
    } else if (/^\d+$/.test(val)) {
      attributes[key] = parseInt(val, 10);
    } else {
      return { attributes: {} as T, body: bodyText };
    }
  }

  if (currentBlockKey) {
    if (currentBlockItems.length === 0) return { attributes: {} as T, body: bodyText };
    attributes[currentBlockKey] = currentBlockItems;
  }

  return { attributes: attributes as T, body: bodyText };
}
