import type { VisualData } from '../types/visuals';

type VisualType = VisualData['type'];
type VisualFile = Record<string, unknown>;

export type VisualRegistryIssueKind = 'malformed-file' | 'missing-id' | 'unsupported-type' | 'duplicate-id';

export interface VisualRegistryIssue {
  kind: VisualRegistryIssueKind;
  path: string;
  message: string;
  id?: string;
  originalPath?: string;
}

export interface VisualRegistryBuildResult {
  registry: Map<string, VisualData>;
  sourcePaths: Map<string, string>;
  issues: VisualRegistryIssue[];
}

export interface VisualRegistryReport {
  totalVisuals: number;
  countByType: Record<VisualType, number>;
  rootLevelVisualsRecovered: number;
  duplicateIds: VisualRegistryIssue[];
  malformedFiles: VisualRegistryIssue[];
  unsupportedFiles: VisualRegistryIssue[];
}

// Visuals historically lived directly in content/visuals before typed folders
// were introduced. Keep one recursive source of truth so both layouts work.
const visualFiles = import.meta.glob('../../content/visuals/**/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

export const supportedVisualTypes = new Set<VisualType>([
  'waveform',
  'timeline',
  'topology',
  'signal-explorer',
  'coverage-map',
  'formal-property',
  'spec-rule-explorer',
]);

function isVisualFile(value: unknown): value is VisualFile {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function inferTypeFromPath(path: string): VisualType | undefined {
  const visualPath = path.split('/content/visuals/')[1] ?? path.split('content/visuals/')[1];
  const isRootLevel = Boolean(visualPath) && !visualPath.includes('/');
  const fileName = path.split('/').pop() ?? '';

  if (isRootLevel) {
    if (fileName.startsWith('wf-')) return 'waveform';
    if (fileName.startsWith('tl-')) return 'timeline';
    if (fileName.startsWith('topo-')) return 'topology';
    if (fileName.startsWith('sig-')) return 'signal-explorer';
    return undefined;
  }

  if (path.includes('/waveforms/')) return 'waveform';
  if (path.includes('/timelines/')) return 'timeline';
  if (path.includes('/topologies/')) return 'topology';
  if (path.includes('/signals/')) return 'signal-explorer';
  if (path.includes('/coverage/')) return 'coverage-map';
  if (path.includes('/formal-properties/')) return 'formal-property';
  return undefined;
}

function normalizeType(type: unknown, path: string): VisualType | undefined {
  // `signals` is the legacy name used by the AXI signal reference asset.
  if (type === 'signals') return 'signal-explorer';
  if (typeof type === 'string') {
    return supportedVisualTypes.has(type as VisualType) ? type as VisualType : undefined;
  }
  return inferTypeFromPath(path);
}

function isRootLevelVisualPath(path: string): boolean {
  const visualPath = path.split('/content/visuals/')[1] ?? path.split('content/visuals/')[1];
  return Boolean(visualPath) && !visualPath.includes('/');
}

function asRecord(value: unknown): VisualFile | undefined {
  return isVisualFile(value) ? value : undefined;
}

function normalizeWaveString(wave: string, dataLabels: unknown): string[] {
  const labels = Array.isArray(dataLabels)
    ? dataLabels.filter((label): label is string => typeof label === 'string')
    : [];
  let labelIndex = 0;
  let previous = '0';

  return Array.from(wave, token => {
    if (token === '.') return previous;
    if (token === '=') {
      previous = labels[labelIndex++] ?? 'DATA';
      return previous;
    }
    if (token === 'x' || token === 'X' || token === 'z' || token === 'Z') {
      previous = token.toUpperCase();
      return previous;
    }
    if (token === 'p' || token === 'P' || token === 'n' || token === 'N') {
      previous = '1';
      return previous;
    }
    previous = token;
    return previous;
  });
}

function normalizeWaveform(rawData: VisualFile): VisualFile {
  const nestedData = asRecord(rawData.data);
  const source = nestedData ? { ...rawData, ...nestedData } : rawData;
  const rawSignals = Array.isArray(source.signals) ? source.signals : [];
  const explicitCycleCount = typeof source.cycleCount === 'number'
    ? source.cycleCount
    : typeof source.totalCycles === 'number'
      ? source.totalCycles
      : undefined;
  const derivedCycleCount = rawSignals.reduce((maximum, rawSignal) => {
    const signal = asRecord(rawSignal);
    const valueCount = Array.isArray(signal?.values) ? signal.values.length : 0;
    const waveCount = typeof signal?.wave === 'string' ? signal.wave.length : 0;
    return Math.max(maximum, valueCount, waveCount);
  }, 0);
  const cycleCount = explicitCycleCount ?? derivedCycleCount;

  const signals = rawSignals.flatMap(rawSignal => {
    const signal = asRecord(rawSignal);
    if (!signal || typeof signal.name !== 'string') return [];

    let values = Array.isArray(signal.values)
      ? signal.values.filter((value): value is string => typeof value === 'string')
      : typeof signal.wave === 'string'
        ? normalizeWaveString(signal.wave, signal.data)
        : [];

    // Early AHB assets stored two identical half-cycle samples per cycle.
    if (explicitCycleCount && values.length === explicitCycleCount * 2) {
      values = Array.from({ length: explicitCycleCount }, (_, index) => values[index * 2]);
    }

    let signalType = signal.type;
    if (signalType !== 'clock' && signalType !== 'control' && signalType !== 'data' && signalType !== 'sideband') {
      signalType = typeof signal.wave === 'string' && /^[pPnN]/.test(signal.wave)
        ? 'clock'
        : Array.isArray(signal.data)
          ? 'data'
          : 'control';
    }

    if (signalType === 'clock') {
      values = Array.from({ length: cycleCount }, () => '1');
    } else if (signalType === 'control') {
      values = values.map(value => value === 'HIGH' ? '1' : value === 'LOW' ? '0' : value);
      if (values.some(value => value !== '0' && value !== '1')) {
        signalType = 'sideband';
      }
    }

    const legacyColors: Record<string, string> = {
      'var(--color-primary)': '#2563eb',
      'var(--color-secondary)': '#7c3aed',
      'var(--color-success)': '#16a34a',
      'var(--color-danger)': '#dc2626',
    };
    const color = typeof signal.color === 'string'
      ? legacyColors[signal.color] ?? signal.color
      : undefined;

    return [{ ...signal, type: signalType, values, color }];
  });

  const rawAnnotations = Array.isArray(source.annotations) ? source.annotations : [];
  const annotations = rawAnnotations.flatMap(rawAnnotation => {
    const annotation = asRecord(rawAnnotation);
    if (!annotation) return [];
    const cycle = typeof annotation.cycle === 'number'
      ? annotation.cycle
      : typeof annotation.time === 'number'
        ? annotation.time
        : undefined;
    const message = typeof annotation.message === 'string'
      ? annotation.message
      : typeof annotation.text === 'string'
        ? annotation.text
        : undefined;
    return message ? [{ ...annotation, cycle, message }] : [];
  });

  return { ...rawData, cycleCount, signals, annotations };
}

function normalizeTimeline(rawData: VisualFile): VisualFile {
  const nestedData = asRecord(rawData.data);
  const rawTransactions = Array.isArray(nestedData?.transactions) ? nestedData.transactions : [];
  if (rawTransactions.length === 0) return rawData;

  const transactions = rawTransactions.flatMap(rawTransaction => {
    const transaction = asRecord(rawTransaction);
    if (!transaction || typeof transaction.id !== 'string' || !Array.isArray(transaction.phases)) return [];
    const phases = transaction.phases.flatMap((rawPhase, phaseIndex) => {
      const phase = asRecord(rawPhase);
      if (!phase || typeof phase.name !== 'string' ||
          typeof phase.startCycle !== 'number' || typeof phase.endCycle !== 'number') return [];
      return [{ ...phase, id: `${transaction.id}-${phaseIndex}-${phase.name}` }];
    });
    return [{ ...transaction, label: typeof transaction.label === 'string' ? transaction.label : transaction.id, phases }];
  });

  const labels = Array.isArray(nestedData?.phases)
    ? nestedData.phases.filter((label): label is string => typeof label === 'string')
    : undefined;
  return { ...rawData, transactions, labels };
}

function normalizeTopology(rawData: VisualFile): VisualFile {
  const nestedData = asRecord(rawData.data);
  const source = nestedData ? { ...rawData, ...nestedData } : rawData;
  const rawNodes = Array.isArray(source.nodes) ? source.nodes : [];
  const nodes = rawNodes.flatMap(rawNode => {
    const node = asRecord(rawNode);
    if (!node || typeof node.id !== 'string' || typeof node.label !== 'string') return [];
    const nodeType = node.type ?? node.role;
    if (nodeType !== 'master' && nodeType !== 'slave' && nodeType !== 'arbiter' && nodeType !== 'bridge' &&
        nodeType !== 'concept' && nodeType !== 'phase' && nodeType !== 'state') return [];
    return [{ ...node, type: nodeType }];
  });

  const rawEdges = Array.isArray(source.edges) ? source.edges : [];
  const edges = rawEdges.flatMap((rawEdge, edgeIndex) => {
    const edge = asRecord(rawEdge);
    if (!edge) return [];
    const sourceId = edge.source ?? edge.from;
    const targetId = edge.target ?? edge.to;
    if (typeof sourceId !== 'string' || typeof targetId !== 'string') return [];
    const id = typeof edge.id === 'string' && edge.id.trim()
      ? edge.id
      : `edge-${edgeIndex}-${sourceId}-${targetId}`;
    return [{ ...edge, id, source: sourceId, target: targetId, active: edge.active === true }];
  });

  const highlightPaths = Array.isArray(source.highlightPaths) ? source.highlightPaths : [];
  const firstHighlightPath = asRecord(highlightPaths[0]);
  let highlightedPath = Array.isArray(source.highlightedPath)
    ? source.highlightedPath.filter((id): id is string => typeof id === 'string')
    : undefined;

  if (!highlightedPath && Array.isArray(firstHighlightPath?.path)) {
    const pathNodes = firstHighlightPath.path.filter((id): id is string => typeof id === 'string');
    highlightedPath = pathNodes.flatMap((nodeId, index) => {
      const nextNodeId = pathNodes[index + 1];
      const connectingEdge = nextNodeId
        ? edges.find(edge => edge.source === nodeId && edge.target === nextNodeId)
        : undefined;
      return connectingEdge ? [nodeId, connectingEdge.id] : [nodeId];
    });
  }

  if (!highlightedPath) {
    const activeEdges = edges.filter(edge => edge.active === true);
    if (activeEdges.length > 0) {
      highlightedPath = Array.from(new Set(activeEdges.flatMap(edge => [edge.source, edge.id, edge.target])));
    }
  }

  return { ...rawData, nodes, edges, highlightedPath };
}

function normalizeVisual(rawData: VisualFile, type: VisualType): VisualData {
  if (type === 'waveform') return { ...normalizeWaveform(rawData), type } as unknown as VisualData;
  if (type === 'timeline') return { ...normalizeTimeline(rawData), type } as unknown as VisualData;
  if (type === 'topology') return { ...normalizeTopology(rawData), type } as unknown as VisualData;
  return { ...rawData, type } as VisualData;
}

export function buildVisualRegistry(files: Record<string, unknown>): VisualRegistryBuildResult {
  const registry = new Map<string, VisualData>();
  const sourcePaths = new Map<string, string>();
  const issues: VisualRegistryIssue[] = [];

  for (const [path, rawData] of Object.entries(files)) {
    if (!isVisualFile(rawData)) {
      issues.push({
        kind: 'malformed-file',
        path,
        message: `Visual file at ${path} must contain a JSON object.`,
      });
      continue;
    }

    if (typeof rawData.id !== 'string' || !rawData.id.trim()) {
      issues.push({
        kind: 'missing-id',
        path,
        message: `Visual file at ${path} is missing a valid 'id' field.`,
      });
      continue;
    }

    const type = normalizeType(rawData.type, path);
    if (!type) {
      issues.push({
        kind: 'unsupported-type',
        path,
        id: rawData.id,
        message: `Visual '${rawData.id}' at ${path} has an unsupported or unknown visual type.`,
      });
      continue;
    }

    if (registry.has(rawData.id)) {
      const originalPath = sourcePaths.get(rawData.id);
      issues.push({
        kind: 'duplicate-id',
        path,
        id: rawData.id,
        originalPath,
        message: `Duplicate visual id '${rawData.id}' found at ${path}; first registered from ${originalPath}.`,
      });
      continue;
    }

    registry.set(rawData.id, normalizeVisual(rawData, type));
    sourcePaths.set(rawData.id, path);
  }

  return { registry, sourcePaths, issues };
}

const productionRegistry = buildVisualRegistry(visualFiles);
const visualRegistry = productionRegistry.registry;

for (const issue of productionRegistry.issues) {
  console.warn(issue.message);
}

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

export function getVisualSourcePath(id: string): string | undefined {
  return productionRegistry.sourcePaths.get(id);
}

export function getVisualRegistryReport(): VisualRegistryReport {
  const countByType: Record<VisualType, number> = {
    waveform: 0,
    timeline: 0,
    topology: 0,
    'signal-explorer': 0,
    'coverage-map': 0,
    'formal-property': 0,
    'spec-rule-explorer': 0,
  };

  for (const visual of visualRegistry.values()) countByType[visual.type] += 1;

  return {
    totalVisuals: visualRegistry.size,
    countByType,
    rootLevelVisualsRecovered: Array.from(productionRegistry.sourcePaths.values()).filter(isRootLevelVisualPath).length,
    duplicateIds: productionRegistry.issues.filter(issue => issue.kind === 'duplicate-id'),
    malformedFiles: productionRegistry.issues.filter(issue => issue.kind === 'malformed-file' || issue.kind === 'missing-id'),
    unsupportedFiles: productionRegistry.issues.filter(issue => issue.kind === 'unsupported-type'),
  };
}
