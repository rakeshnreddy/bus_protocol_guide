import { Link } from 'react-router-dom';
import './Home.css';

function ScopeIllustration() {
  return (
    <div className="home-scope" aria-hidden="true">
      <div className="scope-toolbar">
        <span>AHB / transfer_04</span>
        <span className="scope-live"><i /> sampled</span>
      </div>
      <svg viewBox="0 0 620 300" role="presentation">
        <g className="scope-grid">
          {Array.from({ length: 8 }, (_, index) => <line key={`v-${index}`} x1={90 + index * 68} y1="30" x2={90 + index * 68} y2="272" />)}
          {Array.from({ length: 5 }, (_, index) => <line key={`h-${index}`} x1="28" y1={56 + index * 52} x2="596" y2={56 + index * 52} />)}
        </g>
        <g className="scope-labels">
          <text x="28" y="48">HCLK</text>
          <text x="28" y="100">HTRANS</text>
          <text x="28" y="152">HADDR</text>
          <text x="28" y="204">HREADY</text>
          <text x="28" y="256">HWDATA</text>
        </g>
        <path className="trace-clock" d="M90 52V34h34v18h34V34h34v18h34V34h34v18h34V34h34v18h34V34h34v18h34V34h34v18h34V34h34v18" />
        <g className="trace-boxes trace-primary">
          <path d="M90 108 100 84h116l10 24-10 24H100Z" />
          <path d="M226 108 236 84h116l10 24-10 24H236Z" />
          <path d="M362 108 372 84h116l10 24-10 24H372Z" />
          <text x="158" y="113">NONSEQ</text><text x="294" y="113">SEQ</text><text x="430" y="113">SEQ</text>
        </g>
        <g className="trace-boxes trace-address">
          <path d="M90 160 100 136h116l10 24-10 24H100Z" />
          <path d="M226 160 236 136h116l10 24-10 24H236Z" />
          <path d="M362 160 372 136h116l10 24-10 24H372Z" />
          <text x="158" y="165">0x50</text><text x="294" y="165">0x54</text><text x="430" y="165">0x58</text>
        </g>
        <path className="trace-ready" d="M90 224v-34h136v34h68v-34h136v34h68v-34h90" />
        <g className="trace-boxes trace-data">
          <path d="M226 264 236 240h116l10 24-10 24H236Z" />
          <path d="M362 264 372 240h116l10 24-10 24H372Z" />
          <text x="294" y="269">D0</text><text x="430" y="269">D1</text>
        </g>
        <rect className="scope-focus" x="224" y="28" width="140" height="264" rx="8" />
      </svg>
      <div className="scope-caption">
        <span><i className="phase-address" /> Address phase</span>
        <span><i className="phase-data" /> Data phase</span>
        <strong>Cycle 3 selected</strong>
      </div>
    </div>
  );
}

const protocols = [
  { name: 'Foundations', count: 6, copy: 'Signal thinking, timing diagrams, and verification mindset.', to: '/foundations', tone: 'foundations' },
  { name: 'AMBA AHB', count: 38, copy: 'Pipelining, bursts, wait states, arbitration, and debug.', to: '/ahb', tone: 'ahb' },
  { name: 'AMBA AXI', count: 44, copy: 'Independent channels, ordering, outstanding traffic, and backpressure.', to: '/axi', tone: 'axi' },
];

export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <div className="home-context"><span /> Visual protocol learning for design verification</div>
          <h1>See the bus before you verify it.</h1>
          <p>
            A comprehensive, visual protocol academy that connects specification rules to cycles, signals,
            transactions, and the bugs a verifier must catch.
          </p>
          <div className="home-actions">
            <Link className="primary-action" to="/lesson/01_ahb_overview">Start the AHB path</Link>
            <Link className="secondary-action" to="/visuals">Explore 52 visuals</Link>
          </div>
          <dl className="home-facts">
            <div><dt>88</dt><dd>lessons</dd></div>
            <div><dt>52</dt><dd>interactive visuals</dd></div>
            <div><dt>Local</dt><dd>private by design</dd></div>
          </dl>
        </div>
        <ScopeIllustration />
      </section>

      <section className="home-learning-map" aria-labelledby="learning-map-title">
        <div className="learning-map-intro">
          <h2 id="learning-map-title">Choose your reasoning depth</h2>
          <p>Start with timing fundamentals, then move into protocol-specific verification and debug.</p>
        </div>
        <div className="protocol-rows">
          {protocols.map(protocol => (
            <Link key={protocol.name} to={protocol.to} className={`protocol-row tone-${protocol.tone}`}>
              <span className="protocol-row-signal" aria-hidden="true" />
              <strong>{protocol.name}</strong>
              <span className="protocol-row-copy">{protocol.copy}</span>
              <span className="protocol-row-count">{protocol.count} lessons</span>
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6" /></svg>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-tools" aria-label="Academy tools">
        <Link to="/visuals">
          <span className="tool-index">01</span>
          <div><strong>Visuals Explorer</strong><span>Filter every waveform, topology, timeline, and signal guide.</span></div>
        </Link>
        <Link to="/glossary">
          <span className="tool-index">02</span>
          <div><strong>Protocol Glossary</strong><span>Resolve signal names and concepts without breaking study flow.</span></div>
        </Link>
        <Link to="/reference/spec-rules">
          <span className="tool-index">03</span>
          <div><strong>Specification Rules</strong><span>Connect shall and must statements directly to bug signatures.</span></div>
        </Link>
      </section>
    </div>
  );
}
