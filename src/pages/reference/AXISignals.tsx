import SignalExplorer from '../../components/visuals/SignalExplorer';
import axiSignalsData from '../../../content/visuals/axi-signal-ref.json';
import type { SignalExplorerData } from '../../types/visuals';

export default function AXISignals() {
  return (
    <div className="page-container">
      <h2>AXI Signal Reference</h2>
      <p>Comprehensive quick reference for all primary AXI signals across the 5 channels.</p>
      <SignalExplorer data={axiSignalsData as SignalExplorerData} />
    </div>
  );
}
