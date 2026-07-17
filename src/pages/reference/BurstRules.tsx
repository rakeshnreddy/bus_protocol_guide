import { Link } from 'react-router-dom';

export default function BurstRules() {
  return (
    <div className="page-container">
      <h2>Burst Rules Reference</h2>
      <div className="reference-content">
        <h3>AHB Bursts (HBURST) <span style={{fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem'}}>Taught in <Link to="/lesson/07_burst_and_size">07_burst_and_size</Link></span></h3>
        <ul>
          <li><strong>SINGLE:</strong> Single transfer.</li>
          <li><strong>INCR:</strong> Undefined length incrementing burst.</li>
          <li><strong>WRAP4, WRAP8, WRAP16:</strong> Wrapping bursts of 4, 8, 16 beats. Wrap address = (Start_Addr & ~(Total_Bytes - 1)).</li>
          <li><strong>INCR4, INCR8, INCR16:</strong> Incrementing bursts of 4, 8, 16 beats.</li>
        </ul>
        <br/>
        <h3>AXI Bursts (AxBURST) <span style={{fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem'}}>Taught in <Link to="/lesson/23_burst_types">23_burst_types</Link></span></h3>
        <ul>
          <li><strong>FIXED (0b00):</strong> Address remains constant. Used for FIFOs.</li>
          <li><strong>INCR (0b01):</strong> Address increments by AxSIZE per beat.</li>
          <li><strong>WRAP (0b10):</strong> Address increments but wraps at burst boundary. Length must be 2, 4, 8, or 16.</li>
        </ul>
        <br/>
        <h3>The 4KB Boundary Rule (AXI) <span style={{fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem'}}>Taught in <Link to="/lesson/25_4kb_boundary_rule">25_4kb_boundary_rule</Link></span></h3>
        <p>A burst must not cross a 4 KB address boundary. The first and final transferred byte must have the same address bits above bit 11, which keeps one accepted burst within one decode/routing region. This is not a virtual-memory page-fault rule. If a requested byte range crosses the boundary, the manager must issue multiple legal bursts.</p>
      </div>
    </div>
  );
}
