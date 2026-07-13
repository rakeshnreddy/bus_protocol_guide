import ProtocolOverview from '../components/ProtocolOverview';

export default function AXI() {
  return (
    <ProtocolOverview
      protocol="axi"
      label="AMBA AXI"
      title="Track every independent channel."
      description="Connect ready/valid handshakes to bursts, IDs, ordering, outstanding transactions, backpressure, and system-level verification strategy."
      focus="Channels, ordering, throughput, verification"
    />
  );
}
