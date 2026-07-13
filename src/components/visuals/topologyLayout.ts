import type { TopologyData } from '../../types/visuals';

type TopologyNode = TopologyData['nodes'][number];
type TopologyEdge = TopologyData['edges'][number];

export interface TopologyPoint {
  x: number;
  y: number;
}

export interface LayoutNode extends TopologyNode {
  x: number;
  y: number;
  width: number;
  height: number;
  lines: string[];
}

export interface LayoutEdge {
  edge: TopologyEdge;
  points: TopologyPoint[];
  path: string;
  label: {
    x: number;
    y: number;
    width: number;
    height: number;
    lines: string[];
  } | null;
}

export interface TopologyLayout {
  width: number;
  height: number;
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  regions: NonNullable<TopologyData['regions']>;
}

const PADDING = 42;
const LABEL_CHARACTER_WIDTH = 6.6;

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function wrapTopologyLabel(label: string, maximumCharacters = 22): string[] {
  return label.split('\n').flatMap(explicitLine => {
    const words = explicitLine.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return [''];

    const lines: string[] = [];
    let currentLine = '';
    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (candidate.length <= maximumCharacters || currentLine.length === 0) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  });
}

function nodeDimensions(node: TopologyNode) {
  const lines = wrapTopologyLabel(node.label);
  const longestLine = Math.max(...lines.map(line => line.length), 1);
  return {
    lines,
    width: node.width ?? clamp(longestLine * 7.4 + 34, 146, 224),
    height: node.height ?? Math.max(54, lines.length * 18 + 24),
  };
}

function autoNodePosition(node: TopologyNode, nodes: TopologyNode[]): TopologyPoint {
  const column = node.type === 'master' ? 0 : node.type === 'slave' ? 2 : 1;
  const peers = nodes.filter(candidate => {
    const candidateColumn = candidate.type === 'master' ? 0 : candidate.type === 'slave' ? 2 : 1;
    return candidateColumn === column;
  });
  const peerIndex = peers.findIndex(candidate => candidate.id === node.id);
  const count = Math.max(peers.length, 1);
  const spacing = Math.max(105, 420 / count);
  return {
    x: [130, 480, 830][column],
    y: 90 + spacing / 2 + peerIndex * spacing,
  };
}

function connectionAnchor(node: LayoutNode, toward: TopologyPoint): TopologyPoint {
  const dx = toward.x - node.x;
  const dy = toward.y - node.y;
  if (Math.abs(dx) >= Math.abs(dy)) {
    return { x: node.x + Math.sign(dx || 1) * node.width / 2, y: node.y };
  }
  return { x: node.x, y: node.y + Math.sign(dy || 1) * node.height / 2 };
}

function removeRedundantPoints(points: TopologyPoint[]): TopologyPoint[] {
  return points.filter((point, index) => {
    const previous = points[index - 1];
    const next = points[index + 1];
    if (previous && previous.x === point.x && previous.y === point.y) return false;
    if (!previous || !next) return true;
    const vertical = previous.x === point.x && point.x === next.x;
    const horizontal = previous.y === point.y && point.y === next.y;
    return !vertical && !horizontal;
  });
}

function automaticRoute(source: LayoutNode, target: LayoutNode): TopologyPoint[] {
  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const horizontal = Math.abs(dx) >= Math.abs(dy);
  const start = connectionAnchor(source, target);
  const end = connectionAnchor(target, source);

  if (horizontal && Math.abs(start.y - end.y) < 2) return [start, end];
  if (!horizontal && Math.abs(start.x - end.x) < 2) return [start, end];

  if (horizontal) {
    const middleX = (start.x + end.x) / 2;
    return removeRedundantPoints([start, { x: middleX, y: start.y }, { x: middleX, y: end.y }, end]);
  }

  const middleY = (start.y + end.y) / 2;
  return removeRedundantPoints([start, { x: start.x, y: middleY }, { x: end.x, y: middleY }, end]);
}

function routedPoints(edge: TopologyEdge, source: LayoutNode, target: LayoutNode): TopologyPoint[] {
  if (!edge.waypoints?.length) return automaticRoute(source, target);
  const firstWaypoint = edge.waypoints[0];
  const lastWaypoint = edge.waypoints[edge.waypoints.length - 1];
  const start = connectionAnchor(source, firstWaypoint);
  const end = connectionAnchor(target, lastWaypoint);
  const startElbow = start.x !== firstWaypoint.x && start.y !== firstWaypoint.y
    ? Math.abs(firstWaypoint.x - source.x) >= Math.abs(firstWaypoint.y - source.y)
      ? { x: firstWaypoint.x, y: start.y }
      : { x: start.x, y: firstWaypoint.y }
    : null;
  const endElbow = lastWaypoint.x !== end.x && lastWaypoint.y !== end.y
    ? Math.abs(lastWaypoint.x - target.x) >= Math.abs(lastWaypoint.y - target.y)
      ? { x: lastWaypoint.x, y: end.y }
      : { x: end.x, y: lastWaypoint.y }
    : null;
  return removeRedundantPoints([
    start,
    ...(startElbow ? [startElbow] : []),
    ...edge.waypoints,
    ...(endElbow ? [endElbow] : []),
    end,
  ]);
}

export function roundedTopologyPath(points: TopologyPoint[], radius = 10): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;

  for (let index = 1; index < points.length - 1; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    const next = points[index + 1];
    const incomingLength = Math.hypot(current.x - previous.x, current.y - previous.y);
    const outgoingLength = Math.hypot(next.x - current.x, next.y - current.y);
    const cornerRadius = Math.min(radius, incomingLength / 2, outgoingLength / 2);
    const before = {
      x: current.x - ((current.x - previous.x) / incomingLength) * cornerRadius,
      y: current.y - ((current.y - previous.y) / incomingLength) * cornerRadius,
    };
    const after = {
      x: current.x + ((next.x - current.x) / outgoingLength) * cornerRadius,
      y: current.y + ((next.y - current.y) / outgoingLength) * cornerRadius,
    };
    path += ` L ${before.x} ${before.y} Q ${current.x} ${current.y} ${after.x} ${after.y}`;
  }

  const last = points[points.length - 1];
  return `${path} L ${last.x} ${last.y}`;
}

function edgeLabel(edge: TopologyEdge, points: TopologyPoint[]) {
  if (!edge.label) return null;
  const lines = wrapTopologyLabel(edge.label, 30);
  const longestLine = Math.max(...lines.map(line => line.length), 1);
  const longestSegment = points.slice(0, -1).reduce((best, point, index) => {
    const next = points[index + 1];
    const length = Math.hypot(next.x - point.x, next.y - point.y);
    return length > best.length ? { start: point, end: next, length } : best;
  }, { start: points[0], end: points[points.length - 1], length: -1 });
  const position = edge.labelPosition ?? {
    x: (longestSegment.start.x + longestSegment.end.x) / 2,
    y: (longestSegment.start.y + longestSegment.end.y) / 2,
  };

  return {
    ...position,
    width: Math.min(226, longestLine * LABEL_CHARACTER_WIDTH + 22),
    height: lines.length * 16 + 12,
    lines,
  };
}

export function createTopologyLayout(data: TopologyData): TopologyLayout {
  const initialNodes: LayoutNode[] = data.nodes.map(node => {
    const dimensions = nodeDimensions(node);
    const autoPosition = autoNodePosition(node, data.nodes);
    return {
      ...node,
      ...dimensions,
      x: node.x ?? autoPosition.x,
      y: node.y ?? autoPosition.y,
    };
  });

  const coordinateBounds = [
    ...initialNodes.flatMap(node => [
      { x: node.x - node.width / 2, y: node.y - node.height / 2 },
      { x: node.x + node.width / 2, y: node.y + node.height / 2 },
    ]),
    ...(data.regions ?? []).flatMap(region => [
      { x: region.x, y: region.y },
      { x: region.x + region.width, y: region.y + region.height },
    ]),
    ...data.edges.flatMap(edge => edge.waypoints ?? []),
  ];
  const minX = Math.min(...coordinateBounds.map(point => point.x), 0);
  const minY = Math.min(...coordinateBounds.map(point => point.y), 0);
  const maxX = Math.max(...coordinateBounds.map(point => point.x), 900);
  const maxY = Math.max(...coordinateBounds.map(point => point.y), 460);
  const shiftX = PADDING - minX;
  const shiftY = PADDING - minY;

  const nodes = initialNodes.map(node => ({ ...node, x: node.x + shiftX, y: node.y + shiftY }));
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const edges = data.edges.flatMap(edge => {
    const source = nodeMap.get(edge.source);
    const target = nodeMap.get(edge.target);
    if (!source || !target) return [];
    const shiftedEdge = edge.waypoints || edge.labelPosition ? {
      ...edge,
      waypoints: edge.waypoints?.map(point => ({ x: point.x + shiftX, y: point.y + shiftY })),
      labelPosition: edge.labelPosition
        ? { x: edge.labelPosition.x + shiftX, y: edge.labelPosition.y + shiftY }
        : undefined,
    } : edge;
    const points = routedPoints(shiftedEdge, source, target);
    return [{ edge: shiftedEdge, points, path: roundedTopologyPath(points), label: edgeLabel(shiftedEdge, points) }];
  });

  return {
    width: maxX - minX + PADDING * 2,
    height: maxY - minY + PADDING * 2,
    nodes,
    edges,
    regions: (data.regions ?? []).map(region => ({
      ...region,
      x: region.x + shiftX,
      y: region.y + shiftY,
    })),
  };
}
