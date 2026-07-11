import SignalExplorer from '../../components/visuals/SignalExplorer';
import ahbSignalsData from '../../../content/visuals/sig-ahb-full.json';
import type { SignalExplorerData } from '../../types/visuals';

export default function AHBSignals() {
  return (
    <div className="page-container">
      <h2>AHB Signal Reference</h2>
      <p>Comprehensive quick reference for all primary AHB signals.</p>
      <SignalExplorer data={ahbSignalsData as SignalExplorerData} />
    </div>
  );
}
