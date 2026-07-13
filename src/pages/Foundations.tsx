import ProtocolOverview from '../components/ProtocolOverview';

export default function Foundations() {
  return (
    <ProtocolOverview
      protocol="foundations"
      label="Foundations"
      title="Build the mental model first."
      description="Learn to read signals, timing, handshakes, transaction structure, and verification intent before protocol-specific rules add complexity."
      focus="Signals, timing, and DV reasoning"
    />
  );
}
