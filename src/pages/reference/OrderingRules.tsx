import { Link } from 'react-router-dom';

export default function OrderingRules() {
  return (
    <div className="page-container">
      <h2>Ordering Rules Reference</h2>
      <div className="reference-content">
        <h3>AHB Ordering <span style={{fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem'}}>Taught in <Link to="/lesson/19_timing_and_pipelining">19_timing_and_pipelining</Link></span></h3>
        <p>AHB is inherently pipelined but fundamentally strictly ordered. Since there is only one outstanding address phase at a time and responses (data phase) arrive in the exact order requested, everything happens in strict program order from a single master's perspective.</p>
        <br/>
        <h3>AXI Ordering (ID-Based) <span style={{fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem'}}>Taught in <Link to="/lesson/19_ordering_guarantees">19_ordering_guarantees</Link></span></h3>
        <p>AXI introduces deep out-of-order execution capabilities via transaction IDs (AWID, ARID, WID, BID, RID).</p>
        <ul>
          <li><strong>Rule 1 (Same ID, Same Channel):</strong> Transactions with the same ID on the same channel must complete in order.</li>
          <li><strong>Rule 2 (Different IDs):</strong> Transactions with different IDs can complete in any order.</li>
          <li><strong>Rule 3 (Reads vs Writes):</strong> Reads and writes have no inherent ordering against each other, even if they share the same ID. They must be explicitly synchronized by waiting for the write response (BRESP) before issuing the read.</li>
        </ul>
      </div>
    </div>
  );
}
