/**
 * Types defining the core visual data models for the Bus Protocol DV Academy.
 * Based on the specifications in docs/03_VISUAL_SYSTEM.md.
 */

export interface Annotation {
  cycle?: number;     // For waveforms
  phase?: string;     // For timelines
  nodeId?: string;    // For topologies
  edgeId?: string;    // For topologies
  message: string;
}

/**
 * Data model for a Waveform Visualizer.
 * Supports Foundations, AHB, and AXI signal timing diagrams.
 */
export interface WaveformVisualData {
  id: string;
  type: 'waveform';
  title: string;
  description?: string;
  cycleCount: number;
  signals: {
    name: string;
    type: 'control' | 'data' | 'sideband' | 'clock';
    color?: string;
    values: string[]; // Array of values per cycle, e.g. ["0", "1", "1", "0"] or ["INV", "ADDR", "ADDR", "INV"]
  }[];
  annotations?: Annotation[];
  violations?: {
    cycle: number;
    message: string;
  }[];
}

/**
 * Data model for a Transaction Timeline.
 * Supports abstract phase diagrams (e.g., Arbitration -> Address -> Data -> Response).
 */
export interface TransactionTimelineData {
  id: string;
  type: 'timeline';
  title: string;
  description?: string;
  phases?: {
    id: string;
    name: string;
    durationCycles: number;
    description?: string;
  }[];
  transactions?: {
    id: string;
    label: string;
    color?: string;
    phases: {
      id: string;
      name: string;
      startCycle: number;
      endCycle: number;
      description?: string;
    }[];
  }[];
  labels?: string[];
  annotations?: Annotation[];
}

/**
 * Data model for an Interconnect Topology Viewer.
 * Supports structural diagrams of multi-master/multi-slave systems (AHB/AXI).
 */
export interface TopologyData {
  id: string;
  type: 'topology';
  title: string;
  description?: string;
  nodes: {
    id: string;
    label: string;
    type: 'master' | 'slave' | 'arbiter' | 'bridge' | 'concept' | 'phase' | 'state';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    bidirectional?: boolean;
    kind?: 'request' | 'response' | 'selection' | 'arbitration' | 'data' | 'channel' | 'relationship';
    tone?: 'primary' | 'secondary' | 'neutral';
    waypoints?: { x: number; y: number }[];
    labelPosition?: { x: number; y: number };
  }[];
  regions?: {
    id: string;
    label: string;
    x: number;
    y: number;
    width: number;
    height: number;
    tone?: 'source' | 'fabric' | 'target' | 'concept';
  }[];
  highlightedPath?: string[]; // Array of node or edge IDs to highlight a specific transaction route
  annotations?: Annotation[];
}

/**
 * Data model for an interactive Signal Explorer.
 */
export interface SignalExplorerData {
  id: string;
  type: 'signal-explorer';
  title: string;
  description?: string;
  signals: {
    name: string;
    expansion: string;
    role: 'control' | 'data' | 'sideband' | 'clock';
    description: string;
    group?: string;
    direction?: string;
    sampled?: string;
    values?: string[];
    verificationNote?: string;
    typicalUse?: string;
    relatedTermId?: string;
  }[];
}

/**
 * Data model for a 2D Coverage Map.
 * Visualizes cross-coverage between two protocol dimensions (e.g., Burst Type x Response).
 */
export interface CoverageMapData {
  id: string;
  type: 'coverage-map';
  title: string;
  description?: string;
  xAxis: {
    label: string;
    buckets: string[];
  };
  yAxis: {
    label: string;
    buckets: string[];
  };
  bins: {
    x: string;
    y: string;
    hits: number;
    illegal: boolean;
    tooltip?: string;
  }[];
}

/**
 * Data model for a Formal Property Playground.
 * Bridges abstract formal assertions (SVA-style) with concrete waveform behaviors.
 */
export interface FormalPropertyData {
  id: string;
  type: 'formal-property';
  title: string;
  description?: string;
  property: {
    name: string;
    description: string;
    svaString: string;
    evaluatorRule: string;
  };
  waveform: WaveformVisualData;
  /**
   * List of signal names the learner is allowed to toggle.
   * Note: Categorical signal toggling (e.g. HTRANS between IDLE/NONSEQ) is explicitly out of scope for this component.
   * If a categorical-signal violation needs teaching, use the existing WaveformVisualizer violation-marking feature.
   */
  editableSignals: string[]; 
}

export interface SpecRuleExplorerData {
  id: string;
  type: 'spec-rule-explorer';
  title: string;
  description?: string;
  defaultProtocol?: 'ahb' | 'axi' | 'foundations';
}

// A union type of all possible visual data configurations
export type VisualData = WaveformVisualData | TransactionTimelineData | TopologyData | SignalExplorerData | CoverageMapData | FormalPropertyData | SpecRuleExplorerData;
