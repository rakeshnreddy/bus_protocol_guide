import { getVisualById } from '../../lib/visualLoaders';
import type { VisualRef } from '../../types/content';
import WaveformVisualizer from './WaveformVisualizer';
import TransactionTimeline from './TransactionTimeline';
import TopologyViewer from './TopologyViewer';
import SignalExplorer from './SignalExplorer';
import CoverageMap from './CoverageMap';
import FormalPropertyPlayground from './FormalPropertyPlayground';
import SpecRuleExplorer from './SpecRuleExplorer';

export default function VisualRenderer({ visualRef }: { visualRef: VisualRef, altText?: string }) {
  const data = getVisualById(visualRef.id);
  
  if (!data) {
    return <div className="visual-error" role="alert">Visual not found: {visualRef.id}</div>;
  }
  
  if (data.type === 'waveform') {
    return <WaveformVisualizer data={data as any} />;
  }
  
  if (data.type === 'timeline') {
    return <TransactionTimeline data={data as any} />;
  }
  
  if (data.type === 'topology') {
    return <TopologyViewer data={data as any} />;
  }

  if (data.type === 'signal-explorer') {
    return <SignalExplorer data={data as any} />;
  }

  if (data.type === 'coverage-map') {
    return <CoverageMap data={data as any} />;
  }

  if (data.type === 'formal-property') {
    return <FormalPropertyPlayground data={data as any} />;
  }

  if (data.type === 'spec-rule-explorer') {
    return <SpecRuleExplorer data={data as any} />;
  }
  
  return <div className="visual-error" role="alert">Unknown visual type</div>;
}
