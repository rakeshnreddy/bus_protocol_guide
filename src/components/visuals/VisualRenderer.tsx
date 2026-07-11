import { getVisualById } from '../../lib/visualLoaders';
import type { VisualRef } from '../../types/content';
import WaveformVisualizer from './WaveformVisualizer';
import TransactionTimeline from './TransactionTimeline';
import TopologyViewer from './TopologyViewer';
import SignalExplorer from './SignalExplorer';
import CoverageMap from './CoverageMap';
import FormalPropertyPlayground from './FormalPropertyPlayground';
import SpecRuleExplorer from './SpecRuleExplorer';

export default function VisualRenderer({ visualRef, altText }: { visualRef: VisualRef, altText?: string }) {
  const data = getVisualById(visualRef.id);
  
  if (!data) {
    return <div className="visual-error" style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>Visual not found: {visualRef.id}</div>;
  }
  
  // Optionally override title with altText
  const visualData = altText ? { ...data, title: altText } : data;
  
  if (visualData.type === 'waveform') {
    return <WaveformVisualizer data={visualData as any} />;
  }
  
  if (visualData.type === 'timeline') {
    return <TransactionTimeline data={visualData as any} />;
  }
  
  if (visualData.type === 'topology') {
    return <TopologyViewer data={visualData as any} />;
  }

  if (visualData.type === 'signal-explorer') {
    return <SignalExplorer data={visualData as any} />;
  }

  if (visualData.type === 'coverage-map') {
    return <CoverageMap data={visualData as any} />;
  }

  if (visualData.type === 'formal-property') {
    return <FormalPropertyPlayground data={visualData as any} />;
  }

  if (visualData.type === 'spec-rule-explorer') {
    return <SpecRuleExplorer data={visualData as any} />;
  }
  
  return <div className="visual-error" style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>Unknown visual type</div>;
}
