import ProtocolOverview from '../components/ProtocolOverview';

export default function AHB() {
  return (
    <ProtocolOverview
      protocol="ahb"
      label="AMBA AHB"
      title="Reason through the pipeline."
      description="Follow address and data ownership through bursts, wait states, arbitration, responses, and the bugs that appear when a tightly coupled bus stalls."
      focus="Pipelining, bursts, arbitration, debug"
    />
  );
}
