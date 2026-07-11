import type { VisualData } from '../types/visuals';

// Import all visual JSON files eagerly.
const waveformFiles = import.meta.glob('../../content/visuals/waveforms/**/*.json', { eager: true, import: 'default' });
const timelineFiles = import.meta.glob('../../content/visuals/timelines/**/*.json', { eager: true, import: 'default' });
const topologyFiles = import.meta.glob('../../content/visuals/topologies/**/*.json', { eager: true, import: 'default' });
const signalFiles = import.meta.glob('../../content/visuals/signals/**/*.json', { eager: true, import: 'default' });
const coverageFiles = import.meta.glob('../../content/visuals/coverage/**/*.json', { eager: true, import: 'default' });
const formalPropertyFiles = import.meta.glob('../../content/visuals/formal-properties/**/*.json', { eager: true, import: 'default' });

// We build a fast lookup map: ID -> VisualData
const visualRegistry = new Map<string, VisualData>();

function registerVisuals(files: Record<string, any>, expectedType: 'waveform' | 'timeline' | 'topology' | 'signal-explorer' | 'coverage-map' | 'formal-property') {
  for (const path in files) {
    const data = files[path];
    
    // Safety check - optionally assert type based on expectedType
    if (data && data.id) {
      if (!data.type) {
         data.type = expectedType;
      }
      visualRegistry.set(data.id, data as VisualData);
    } else {
      console.warn(`Visual file at ${path} is missing an 'id' field.`);
    }
  }
}

// Register all available visuals
registerVisuals(waveformFiles, 'waveform');
registerVisuals(timelineFiles, 'timeline');
registerVisuals(topologyFiles, 'topology');
registerVisuals(signalFiles, 'signal-explorer');
registerVisuals(coverageFiles, 'coverage-map');
registerVisuals(formalPropertyFiles, 'formal-property');

/**
 * Get a visual configuration by its unique ID.
 * Returns the typed data if found, or undefined.
 */
export function getVisualById(id: string): VisualData | undefined {
  return visualRegistry.get(id);
}

/**
 * Get all loaded visuals (useful for debugging or gallery views).
 */
export function getAllVisuals(): VisualData[] {
  return Array.from(visualRegistry.values());
}
