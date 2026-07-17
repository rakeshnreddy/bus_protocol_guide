import { describe, expect, it } from 'vitest';
import { getChecklistById, getExerciseById, getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';
import specRulesData from '../content/reference/spec-rules.json';

function lessonBody(protocol: 'foundations' | 'ahb' | 'axi', order: number) {
  const lesson = getLessons().find(
    item => item.lesson.protocol === protocol && item.lesson.order === order,
  );
  if (!lesson) throw new Error(`Missing ${protocol} lesson ${order}`);
  return lesson.body;
}

function checkerModel(id: string) {
  const visual = getVisualById(id);
  if (!visual || visual.type !== 'checker-model') throw new Error(`Missing checker model ${id}`);
  return visual;
}

describe('Audit remediation protocol-accuracy guards', () => {
  describe('R1 Foundations', () => {
    // IHI 0033B.b sections 3.1 and 3.5 show an AHB address/control
    // phase for every burst transfer. IHI 0022H A3.4 defines the
    // separate AXI read/write burst structures.
    it('uses protocol-specific architecture and transaction definitions', () => {
      const mentalModels = lessonBody('foundations', 1);
      expect(mentalModels).toMatch(/interface.*signal boundary/i);
      expect(mentalModels).toMatch(/shared.*bus.*topology/i);
      expect(mentalModels).toMatch(/AHB:.*every accepted burst beat.*address\/control phase/is);
      expect(mentalModels).toMatch(/AXI write:.*AW.*W.*B/is);
      expect(mentalModels).toMatch(/routes, targets, and shared internal resources do not conflict/i);
      expect(mentalModels).not.toMatch(/bus is simply a shared communication link/i);
      expect(mentalModels).not.toMatch(/Every protocol separates its wires/i);
    });

    // Both selected AMBA interfaces are synchronous rising-edge interfaces,
    // but setup/hold and CDC are implementation-domain concerns. An RTL X is
    // not a literal representation of analog metastability.
    it('scopes sampling claims and separates X from metastability', () => {
      const signalThinking = lessonBody('foundations', 2);
      expect(signalThinking).toMatch(/AHB uses `HCLK`.*AXI uses `ACLK`/is);
      expect(signalThinking).toMatch(/physical.*metastability.*analog/is);
      expect(signalThinking).toMatch(/`X`.*simulation evidence.*not.*analog voltage/is);
      expect(signalThinking).toMatch(/glitches.*combinational feedback.*CDC/is);
      expect(signalThinking).not.toMatch(/What the signal does in between clock edges generally does not matter/i);
      expect(signalThinking).not.toMatch(/almost all modern protocols sample/i);
    });

    // IHI 0033B.b 3.1/3.6 define phase overlap and wait behavior; IHI 0022H
    // A3-A6 separately defines channel handshakes, outstanding state and IDs.
    it('separates AHB phase pipelining from AXI outstanding transactions', () => {
      const timing = lessonBody('foundations', 3);
      expect(timing).toMatch(/does.*not.*create an AXI-style arbitrary outstanding queue/is);
      expect(timing).toMatch(/Latency:.*Throughput:.*Pipeline overlap.*Outstanding count/is);
      expect(timing).toMatch(/AHB monitor.*valid address phase is accepted/is);
      expect(timing).not.toMatch(/must have internal registers/i);
    });

    // IHI 0022H A3.2-A3.3 defines source/destination handshake rules and
    // channel dependencies. Original AHB arbitration is separate from AHB
    // HREADY transfer flow control.
    it('keeps AXI acceptance, AHB flow control, and original-AHB arbitration separate', () => {
      const handshakes = lessonBody('foundations', 4);
      expect(handshakes).toMatch(/source must not wait for `READY`/i);
      expect(handshakes).toMatch(/subordinate is the source on B and R/i);
      expect(handshakes).toMatch(/prohibits combinational paths between interface inputs and outputs/i);
      expect(handshakes).toMatch(/`HREADY` is the AHB transfer-flow-control signal/i);
      expect(handshakes).toMatch(/request\/grant.*arbitration/i);
      expect(handshakes).not.toMatch(/Whether it's Ready\/Valid or Request\/Grant, the core concept is the same/i);
    });

    // IHI 0022H A5/A6 defines reusable ordering identifiers. IHI 0033B.b 8
    // defines monitored exclusive accesses rather than address reservation.
    it('uses exact ID, ordering, exclusive, lock, and response terminology', () => {
      const transactions = lessonBody('foundations', 5);
      expect(transactions).toMatch(/IDs identify ordering and correlation streams/i);
      expect(transactions).toMatch(/same ID can be reused/i);
      expect(transactions).toMatch(/locked.*retains ownership/is);
      expect(transactions).toMatch(/exclusive.*does not reserve the address/is);
      expect(transactions).toMatch(/AHB-Lite\/AHB5.*`HRESP=OKAY`.*two-cycle `ERROR`/is);
      expect(transactions).not.toMatch(/Do not let anyone else touch this memory address/i);
    });

    it('teaches configuration-aware stimulus and evidence-based signoff', () => {
      const mindset = lessonBody('foundations', 6);
      expect(mindset).toMatch(/If it advertises 16 outstanding reads/i);
      expect(mindset).toMatch(/explicitly labeled negative-test path/i);
      expect(mindset).toMatch(/Coverage records whether.*sampled.*does not prove/is);
      expect(mindset).toMatch(/assertion results and vacuity review/i);
      expect(mindset).not.toMatch(/Until your coverage metric hits 100%/i);
      expect(mindset).not.toMatch(/Constrained Random Testing \(CRT\)/i);
    });

    it('upgrades the foundation exercises from slogans to protocol evidence', () => {
      expect(getExerciseById('ex-bus-architectures')?.prompt).toMatch(/same target/i);
      expect(getExerciseById('ex-signal-thinking')?.expectedTakeaway).toMatch(/metastability/i);
      expect(getExerciseById('ex-timing-diagrams')?.expectedTakeaway).toMatch(/HREADY HIGH/i);
      expect(getExerciseById('ex-handshakes')?.prompt).toMatch(/read-data channel/i);
      expect(getExerciseById('ex-transaction-structure')?.prompt).toMatch(/reuse ID 5/i);
      expect(getExerciseById('ex-dv-mindset')?.expectedTakeaway).toMatch(/negative-test path/i);
    });

    it('makes every mindset checklist item an evidence category', () => {
      const checklist = getChecklistById('dv-mindset');
      expect(checklist?.items).toHaveLength(7);
      const text = checklist?.items.map(item => item.description).join(' ') ?? '';
      for (const category of ['Stimulus:', 'Checking:', 'Coverage:', 'Formal:', 'Progress:', 'Signoff:']) {
        expect(text).toContain(category);
      }
      expect(text).toMatch(/artifact.*owner.*configuration.*waiver.*reviewer/i);
    });

    it('keeps linked visuals consistent with accepted-edge and ownership rules', () => {
      const topology = getVisualById('tp-bus-architectures');
      const sampling = getVisualById('wf-signal-sampling');
      const pipeline = getVisualById('wf-pipeline-timing');
      const handshake = getVisualById('wf-handshake-backpressure');
      const ordering = getVisualById('tl-burst-transfer');

      expect(JSON.stringify(topology)).toMatch(/same-target requests.*arbitration/i);
      expect(sampling?.description).toMatch(/setup and hold.*implementation constraints/i);
      expect(JSON.stringify(sampling)).toMatch(/RTL X.*not.*analog metastable/i);
      expect(pipeline?.description).toMatch(/HREADY.*completes.*accepts/i);
      expect(JSON.stringify(pipeline)).toMatch(/visible but pending.*not accepted/i);
      expect(handshake?.description).toMatch(/subordinate.*R-channel source/i);
      expect(JSON.stringify(handshake)).toMatch(/accepted now/i);
      expect(ordering?.description).toMatch(/different IDs.*finish before/i);
      expect(JSON.stringify(ordering)).toMatch(/legal, not mandatory/i);
    });
  });

  describe('R2 AHB P0 — overview and interface contract', () => {
    it('distinguishes original shared AHB from modern single-manager AHB5', () => {
      const body = lessonBody('ahb', 1);
      expect(body).toMatch(/original shared-bus protocol.*IHI 0011A/is);
      expect(body).toMatch(/single-manager interface model.*IHI 0033B\.b/is);
      expect(body).toMatch(/wait state extends the current data\/response phase/is);
      expect(body).toMatch(/visible but is not accepted/is);
      expect(body).toMatch(/AXI.*constrained by IDs.*ordering rules/is);
      expect(body).not.toMatch(/early Cortex/i);
      expect(body).not.toMatch(/address phase.*one clock cycle, unless the bus is stalled/i);
    });

    it('gates variant behavior by revision and declared property', () => {
      const body = lessonBody('ahb', 2);
      expect(body).toMatch(/AMBA Specification IHI 0011A/i);
      expect(body).toMatch(/AMBA 5 AHB IHI 0033B\.b/i);
      expect(body).toMatch(/optional declared interface properties/i);
      expect(body).toMatch(/`HMASTLOCK` remains a defined interface signal/i);
      expect(body).toMatch(/selecting the exact revision and declared properties/i);
      expect(body).not.toMatch(/90%|effectively obsolete|almost never/i);
    });

    it('uses protocol names separately from project topology and suffixes', () => {
      const body = lessonBody('ahb', 3);
      expect(body).toMatch(/`AW`, `W`, `B`, `AR`, and `R`/i);
      expect(body).toMatch(/physical blocks depend on topology/i);
      expect(body).toMatch(/default\/error subordinate/i);
      expect(body).toMatch(/RTL naming conventions, not AHB protocol signal names/i);
      expect(body).not.toMatch(/AXI \(where signals start with `A`/i);
    });

    it('applies signal-specific clock and reset requirements', () => {
      const body = lessonBody('ahb', 4);
      expect(body).toMatch(/Stable_Between_Clock=True/i);
      expect(body).toMatch(/not automatically an AHB protocol violation/i);
      expect(body).toMatch(/managers.*`HTRANS=IDLE`.*subordinates.*`HREADYOUT` HIGH/is);
      expect(body).toMatch(/does not require every implementation.*extra IDLE cycle/is);
      expect(body).not.toMatch(/all masters and slaves must immediately drive.*usually 0/is);
    });

    it('defines exact base address and protection attributes', () => {
      const body = lessonBody('ahb', 5);
      expect(body).toMatch(/byte address in the system address map/i);
      expect(body).toMatch(/IHI 0011A and IHI 0033B\.b define.*`HADDR\[31:0\]`/is);
      expect(body).toMatch(/`HPROT\[0\]`: `1` data access, `0` instruction fetch/i);
      expect(body).toMatch(/`HPROT\[4\]` is Lookup.*`HPROT\[5\]` Allocate.*`HPROT\[6\]` Shareable/is);
      expect(body).toMatch(/does not require every subordinate to enforce/i);
      expect(body).toMatch(/`HTRANS`.*`HSIZE`.*`HBURST`.*`HMASTLOCK`/is);
      expect(body).not.toMatch(/target physical address|can be 64 bits/i);
    });
  });

  describe('R2 AHB P0 — core transfer mechanics', () => {
    it('defines HTRANS in the visible address phase and counts accepted beats', () => {
      const body = lessonBody('ahb', 6);
      expect(body).toMatch(/currently visible address phase/i);
      expect(body).toMatch(/byte increment is `1 << HSIZE`/i);
      expect(body).toMatch(/`BUSY` does not itself guarantee arbitration ownership/i);
      expect(body).toMatch(/Only `NONSEQ` or `SEQ` with global `HREADY` HIGH/i);
      expect(body).toMatch(/fixed-length burst.*declared accepted beats.*undefined-length `INCR`.*1KB/is);
      expect(body).not.toMatch(/Address \+ 4/i);
    });

    it('gates all HSIZE values and applies accepted-beat and 1KB rules', () => {
      const body = lessonBody('ahb', 7);
      for (const encoding of ['`000`', '`001`', '`010`', '`011`', '`100`', '`101`', '`110`', '`111`']) {
        expect(body).toContain(encoding);
      }
      expect(body).toMatch(/`bytes_per_beat = 1 << HSIZE`/i);
      expect(body).toMatch(/accepted valid beats/i);
      expect(body).toMatch(/Every AHB burst.*1KB/is);
    });

    it('separates HREADYOUT, global HREADY, held context, and ERROR timing', () => {
      const body = lessonBody('ahb', 8);
      expect(body).toMatch(/Each subordinate drives.*`HREADYOUT`/is);
      expect(body).toMatch(/global.*HREADY.*pipeline completion\/advance/is);
      expect(body).toMatch(/`HADDR`.*`HWRITE`.*`HSIZE`.*`HBURST`.*`HPROT`.*`HMASTLOCK`/is);
      expect(body).toMatch(/Normal wait states keep `HRESP=OKAY`/i);
      expect(body).toMatch(/ERROR1.*`HRESP=ERROR`.*`HREADYOUT=LOW`.*ERROR2.*`HREADYOUT=HIGH`/is);
      expect(body).toMatch(/current data phase.*not.*next visible address/is);
    });

    it('keeps lock, exclusive, and security as different configured mechanisms', () => {
      const body = lessonBody('ahb', 9);
      expect(body).toMatch(/Locking exists in original AHB/i);
      expect(body).toMatch(/per-manager `HLOCKx`.*bus-level `HMASTLOCK`/is);
      expect(body).toMatch(/declares.*`Exclusive_Transfers`/i);
      expect(body).toMatch(/exclusive-read response uses `HEXOKAY=1`/i);
      expect(body).toMatch(/`HMASTER`.*matching address\/granule.*attributes/is);
      expect(body).toMatch(/`HEXOKAY = 0`.*`HRESP = OKAY`.*write fails/is);
      expect(body).toMatch(/unauthorized read.*leaking.*unauthorized write.*changing/is);
    });

    it('teaches sequential phases for one SINGLE and qualified arbitration', () => {
      const body = lessonBody('ahb', 10);
      expect(body).toMatch(/two sequential phases for that transfer/i);
      expect(body).toMatch(/may extend this phase.*wait states/is);
      expect(body).toMatch(/next.*address phase can overlap.*current.*data phase/is);
      expect(body).toMatch(/Only original shared-bus AHB exposes an arbiter/i);
      expect(body).not.toMatch(/two overlapping phases/i);
    });

    it('handles manager-driven HADDR and the precise stalled HTRANS exceptions', () => {
      const body = lessonBody('ahb', 11);
      expect(body).toMatch(/`HADDR` driven by the manager/i);
      expect(body).toMatch(/permitted `BUSY` cycles/i);
      expect(body).toMatch(/`HBURST=SINGLE` cannot continue with `BUSY`/i);
      expect(body).toMatch(/IDLE can change to NONSEQ.*BUSY.*first cycle.*ERROR/is);
      expect(body).toMatch(/undefined-length `INCR`.*`BUSY`.*`IDLE`.*`NONSEQ`/is);
    });

    it('uses accepted-beat progression and restarts INCR before 1KB', () => {
      const body = lessonBody('ahb', 12);
      expect(body).toMatch(/subject to the 1KB boundary rule/i);
      expect(body).toMatch(/ends the burst.*restarts.*`NONSEQ`/is);
      expect(body).toMatch(/only on accepted valid beats.*`HREADY && HTRANS\[1\]`/i);
      expect(body).toMatch(/protocol checker.*predicted next address/is);
      expect(body).not.toMatch(/issuing `SEQ` beats indefinitely/i);
    });

    it('uses the exact wrap formula and alignment scope', () => {
      const body = lessonBody('ahb', 13);
      expect(body).toMatch(/`byte_increment = 1 << HSIZE`/i);
      expect(body).toMatch(/`wrap_span = number_of_beats \* byte_increment`/i);
      expect(body).toMatch(/`wrap_base = floor\(start_address \/ wrap_span\) \* wrap_span`/i);
      expect(body).toMatch(/mod wrap_span/i);
      expect(body).toMatch(/start address must align to `byte_increment`.*does not have to equal `wrap_base`/is);
      expect(body).toMatch(/wrapping burst.*one 1KB/is);
      expect(body).not.toMatch(/until it hits `0x3F`/i);
    });

    it('defines all sizes, scoped lanes, and invalid-stimulus disposition', () => {
      const body = lessonBody('ahb', 14);
      expect(body).toMatch(/`111` 128 bytes/i);
      expect(body).toMatch(/does not exceed the configured data-bus width/i);
      expect(body).toMatch(/byte-sized transfer on a wider interface/i);
      expect(body).toMatch(/32-bit little-endian example/i);
      expect(body).toMatch(/inactive lanes.*not part of the payload/i);
      expect(body).toMatch(/does not define a universal “BLOCK the data phase” recovery/i);
      expect(body).not.toMatch(/smart master/i);
    });

    it('models visible, pending, accepted, and data-owner states', () => {
      const body = lessonBody('ahb', 15);
      expect(body).toMatch(/bus is not “free”/i);
      expect(body).toMatch(/\*\*Visible:\*\*.*\*\*Pending:\*\*.*\*\*Accepted:\*\*/is);
      expect(body).toMatch(/`HREADY` completes the current data phase and permits the address pipeline to advance/i);
    });

    it('scopes wait-state stability and configured liveness', () => {
      const body = lessonBody('ahb', 16);
      expect(body).toMatch(/active subordinate drives `HREADYOUT`.*global `HREADY`/is);
      expect(body).toMatch(/IDLE can change to NONSEQ.*BUSY.*ERROR1/is);
      expect(body).toMatch(/no universal maximum wait-state count/i);
      expect(body).toMatch(/configured implementation contract/i);
    });

    it('uses one coherent INCR4 write example and normalized payload owners', () => {
      const body = lessonBody('ahb', 17);
      const visual = getVisualById('wf-ahb-wait-state-heavy');
      expect(body).toMatch(/`INCR4` \*\*write\*\*.*`HBURST=INCR4`.*`HSIZE=010`.*`HWRITE=1`.*`HRESP=OKAY`/is);
      expect(body).toMatch(/write payload `W0`.*not accepted/is);
      expect(body).toMatch(/Idle address\/control cycle/i);
      expect(body).not.toMatch(/Address Phase 5/i);
      expect(JSON.stringify(visual)).toMatch(/VISIBLE ADDR \| DATA OWNER.*W0.*W3/is);
    });
  });

  describe('R2 AHB P0 — system and advanced behavior', () => {
    it('defines performance measurement points and labels model assumptions', () => {
      const body = lessonBody('ahb', 18);
      expect(body).toMatch(/Address-to-completion latency.*First-beat latency.*Burst completion latency/is);
      expect(body).toMatch(/Throughput.*Completion rate.*Data-bus utilization/is);
      expect(body).toMatch(/hypothetical DDR controller model/i);
      expect(body).toMatch(/contiguous SINGLE transfers and optimize them/i);
      expect(body).toMatch(/`HBURST`.*does not guarantee.*one cycle apart/is);
      expect(body).not.toMatch(/absolute minimum latency.*2 clock cycles/i);
    });

    it('separates grant, accepted ownership, address owner, and response owner', () => {
      const body = lessonBody('ahb', 19);
      expect(body).toMatch(/adds no handover bubble only when/i);
      expect(body).toMatch(/next grant.*accepted owner handover.*`HMASTER`.*visible address.*data\/response phase/is);
      expect(body).toMatch(/original AMBA 2 AHB.*`HMASTER\[3:0\]`/is);
      expect(body).toMatch(/AHB5.*optional Exclusive Transfers.*thread identity.*route identity/is);
    });

    it('uses implementation-neutral accepted decode and a retimed response owner', () => {
      const body = lessonBody('ahb', 20);
      expect(body).toMatch(/centralized, distributed, hierarchical, combinational, or registered/i);
      expect(body).toMatch(/`HSELx && HREADY && HTRANS\[1\]`/i);
      expect(body).toMatch(/response mux.*accepted target selection/is);
      expect(body).toMatch(/current data phase.*next visible address/is);
      expect(body).not.toMatch(/central piece of combinatorial logic.*top bits/is);
    });

    it('labels arbitration, fairness, and starvation as configured policy', () => {
      const body = lessonBody('ahb', 21);
      expect(body).toMatch(/finite starvation bound.*assumptions.*finite current transfers.*eligible requesters.*service quantum/is);
      expect(body).toMatch(/not by itself a base-AHB safety violation/i);
      expect(body).toMatch(/implementation can prefer handover.*burst boundary/is);
      expect(body).toMatch(/Burst-boundary preference.*fairness.*distinct system choices/is);
    });

    it('keeps AHB-Lite simple without erasing its transfer contract', () => {
      const body = lessonBody('ahb', 22);
      expect(body).toMatch(/`HMASTLOCK` remains a defined address\/control signal/i);
      expect(body).toMatch(/obeys reset, `HREADY`.*burst length\/progression.*alignment/is);
      expect(body).toMatch(/same target, a bridge, a limited output port, a shared buffer/is);
      expect(body).not.toMatch(/trivially easy|whenever it wants|only time arbitration happens/i);
    });

    it('uses exact upstream bridge directions and separates reads from writes', () => {
      const body = lessonBody('ahb', 23);
      expect(body).toMatch(/upstream inputs include.*`HSEL`.*`HWDATA`.*global `HREADY`/is);
      expect(body).toMatch(/upstream outputs are `HREADYOUT`, `HRESP`, and `HRDATA`/i);
      expect(body).toMatch(/minimum Setup phase.*Access phase.*`PREADY=0`/is);
      expect(body).toMatch(/For an AHB write.*For an AHB read/is);
      expect(body).toMatch(/unbuffered bridge cannot accept another AHB beat.*`HREADYOUT=0`/is);
      expect(body).not.toMatch(/APB is an unpipelined, 2-cycle protocol/i);
    });

    it('defines the owning subordinate and legal post-ERROR choices', () => {
      const body = lessonBody('ahb', 24);
      expect(body).toMatch(/owning subordinate.*`HREADYOUT = 0`.*global `HREADY = 0`/is);
      expect(body).toMatch(/`HREADYOUT = 1`.*global `HREADY = 1`/is);
      expect(body).toMatch(/Ordinary wait cycles can precede ERROR1.*`HRESP=OKAY`/is);
      expect(body).toMatch(/During ERROR1.*chang.*`HTRANS=IDLE`.*also permits it to continue/is);
    });

    it('locks active ownership only on the applicable path', () => {
      const body = lessonBody('ahb', 25);
      expect(body).toMatch(/must not transfer.*active ownership.*applicable arbitration path/is);
      expect(body).toMatch(/compute or signal a future grant/i);
      expect(body).toMatch(/does not automatically lock every aliased address.*independent route/is);
      expect(body).toMatch(/`HLOCKx`.*bus-level.*`HMASTLOCK`/is);
    });

    it('makes AHB5 exclusive identity, read setup, matching, and failure exact', () => {
      const body = lessonBody('ahb', 26);
      expect(body).toMatch(/optional `Exclusive_Transfers` interface property/i);
      expect(body).toMatch(/Exclusive Read.*`HMASTER`.*`HEXOKAY=1`.*established state/is);
      expect(body).toMatch(/same `HMASTER`.*address or granule.*size.*attributes/is);
      expect(body).toMatch(/must not update memory.*`HRESP=OKAY`, `HEXOKAY=0`/is);
    });

    it('requires configured security enforcement without target-mandatory wording', () => {
      const body = lessonBody('ahb', 27);
      expect(body).toMatch(/source firewall, interconnect protection controller, memory controller, or target/i);
      expect(body).toMatch(/does not universally require every target/i);
      expect(body).toMatch(/denied Non-secure.*read.*must not return Secure data/is);
      expect(body).toMatch(/denied Non-secure.*write.*must not update Secure state/is);
      expect(body).not.toMatch(/slave \*\*must\*\* reject/i);
    });

    it('separates RETRY from SPLIT and records exact HMASTER issue context', () => {
      const body = lessonBody('ahb', 28);
      expect(body).toMatch(/IHI 0011A.*IHI 0033B\.b/i);
      expect(body).toMatch(/RETRY does not use `HSPLITx`/i);
      expect(body).toMatch(/SPLIT.*remove.*eligibility.*`HSPLITx`/is);
      expect(body).toMatch(/B\.b signal table.*`HMASTER\[3:0\]`.*`HMASTER\[m:0\]`.*implementation-defined/is);
      expect(body).toMatch(/every AHB burst.*one 1KB/is);
    });
  });

  describe('R2 AHB P0 — DV, reference, and review lessons', () => {
    it('configures legal and negative stimulus separately with role-specific predictors', () => {
      const body = lessonBody('ahb', 29);
      expect(body).toMatch(/default generator produces only behavior legal for the configured revision/is);
      expect(body).toMatch(/separately labeled negative-test mode/i);
      expect(body).toMatch(/original AHB versus AHB-Lite\/AHB5.*optional security.*exclusive/is);
      expect(body).toMatch(/manager environment predicts.*subordinate environment predicts.*bridge conserves.*interconnect additionally predicts/is);
      expect(body).not.toMatch(/One expected-data path is sufficient for every partition/i);
    });

    it('triages assertion failures and captures phase-aware wrap and write context', () => {
      const body = lessonBody('ahb', 30);
      expect(body).toMatch(/DUT behavior, illegal stimulus, a checker defect, an invalid formal assumption, an unsupported revision\/property configuration, or an intentional negative test/i);
      expect(body).toMatch(/wrap_base \+ \(\(current - wrap_base \+ \(1 << HSIZE\)\) mod wrap_span\)/i);
      expect(body).toMatch(/calculated next beat reaches the upper wrap limit/i);
      expect(body).toMatch(/Capture the accepted address phase's `HWRITE` into data-phase context/i);
      expect(body).not.toMatch(/every assertion failure means.*fix.*RTL/i);
    });

    it('derives coverage legality from revision and retains error beat index', () => {
      const body = lessonBody('ahb', 31);
      expect(body).toMatch(/every supported legal combination/i);
      expect(body).toMatch(/`SPLIT` and `RETRY` are legal response bins only in original AHB mode/i);
      expect(body).toMatch(/Generate legal, illegal, and ignore bins from configuration/i);
      expect(body).toMatch(/Coverage proves that a scenario was sampled, not that the DUT result was correct/i);
      expect(body).toMatch(/first beat.*middle beat.*last beat/is);
    });

    it('starts formal obligations at acceptance and separates configured liveness', () => {
      const body = lessonBody('ahb', 32);
      const visual = getVisualById('fp-ahb-hready-liveness');
      expect(body).toMatch(/accepted.*`HTRANS\[1\] && HREADY`/is);
      expect(body).toMatch(/following data phase.*same-edge `HREADY` cannot satisfy/is);
      expect(body).toMatch(/disable iff \(!HRESETn\)/i);
      expect(body).toMatch(/capture.*`HEXCL`.*`HMASTER`.*direction.*size.*address\/granule.*attributes/is);
      expect(body).toMatch(/teaching contract, not a universal AHB maximum/i);
      expect(JSON.stringify(visual)).toMatch(/##\[1:4\].*HRESETn/is);
      expect(JSON.stringify(visual)).not.toMatch(/##\[0:4\]/i);
    });

    it('classifies common bugs using accepted context and source provenance', () => {
      const body = lessonBody('ahb', 33);
      expect(body).toMatch(/`HREADY && HTRANS\[1\]`/i);
      expect(body).toMatch(/BUSY is not a valid beat/i);
      expect(body).toMatch(/asynchronous latch or a poor clock-gating strategy/i);
      expect(body).toMatch(/Both canceling and continuing are permitted/i);
      expect(body).toMatch(/product\/QoS or configured-service failure only when/i);
      expect(body).toMatch(/provenance names the selected specification issue and section/i);
    });

    it('keeps debug fixes behavioral and identifies the first violating edge', () => {
      const body = lessonBody('ahb', 34);
      expect(body).toMatch(/Behavioral requirement.*hold the write payload.*until that data phase completes/is);
      expect(body).toMatch(/possible implementation, not the protocol-mandated repair architecture/i);
      expect(body).toMatch(/Registering `HSEL` is optional.*legal edge is mandatory/is);
      expect(body).toMatch(/identify the first violating edge/i);
    });

    it('requires evidence-backed rather than checkbox-only signoff', () => {
      const body = lessonBody('ahb', 35);
      expect(body).toMatch(/Checking every box is not itself signoff/i);
      expect(body).toMatch(/linked artifact, owner, specification revision and optional-property configuration, latest regression status, and a reviewed waiver/i);
      const checklist = getChecklistById('chk-ahb-expert');
      expect(checklist?.items).toHaveLength(10);
      expect(checklist?.items.map(item => item.description).join(' ')).toMatch(/versioned configuration manifest.*review evidence.*requirement.*owner.*regression.*waiver/is);
    });

    it('provides exact encodings, response timing, identity, and exclusive restrictions', () => {
      const body = lessonBody('ahb', 36);
      expect(body).toMatch(/`HTRANS\[1:0\]`: `00 IDLE`, `01 BUSY`, `10 NONSEQ`, `11 SEQ`/i);
      expect(body).toMatch(/`HBURST\[2:0\]`: `000 SINGLE`.*`111 INCR16`/is);
      expect(body).toMatch(/`HSIZE\[2:0\]`: `000` through `111` encode 1, 2, 4, 8, 16, 32, 64, and 128 bytes/i);
      expect(body).toMatch(/ERROR1.*`HREADYOUT=LOW`.*ERROR2.*`HREADYOUT=HIGH`/is);
      expect(body).toMatch(/combinational `HSEL` decoder is a common implementation pattern, not a universal requirement/i);
      expect(body).toMatch(/Original AHB uses.*`HMASTER\[3:0\]`.*§8\.3 defines configured `HMASTER\[m:0\]`/is);
      expect(body).toMatch(/single data transfer.*`SINGLE` or `INCR`.*no BUSY.*size-aligned/is);
    });

    it('reviews data ownership before legal ERROR and wait-state classification', () => {
      const body = lessonBody('ahb', 37);
      expect(body).toMatch(/Identify the data-phase owner before judging `HRESP`/i);
      expect(body).toMatch(/Cancellation is permitted, not mandatory/i);
      expect(body).toMatch(/first edge where the master changes address\/control while a valid transfer is still pending/i);
    });

    it('recaps all-burst boundaries and revision-specific advanced mechanisms', () => {
      const body = lessonBody('ahb', 38);
      expect(body).toMatch(/any burst to cross a 1KB boundary/i);
      expect(body).toMatch(/cancellation is not mandatory/i);
      expect(body).toMatch(/Original AHB uses.*`HMASTER\[3:0\]`.*optional AHB5 exclusives/is);
      expect(body).toMatch(/RETRY.*without `HSPLITx`.*SPLIT.*until.*`HSPLITx`/is);
      expect(body).toMatch(/`HLOCKx`\/`HMASTLOCK` retain an arbitration resource.*`HNONSEC`.*system-configured/is);
      expect(body).toMatch(/unbuffered bridge.*cannot accept another upstream beat/is);
      expect(body).toMatch(/Bounded completion and fairness are configured service contracts/i);
    });
  });

  describe('R2 AHB P0 — shared visual, exercise, and rule integrity', () => {
    it('makes reset, address/control, HTRANS, and burst visuals accepted-edge aware', () => {
      const reset = getVisualById('wf-ahb-reset');
      const address = getVisualById('sig-ahb-address-control');
      const htrans = getVisualById('wf-ahb-htrans-sequences');
      const burst = getVisualById('sig-ahb-burst-size');
      expect(JSON.stringify(reset)).toMatch(/does not mandate an extra full IDLE cycle/i);
      expect(JSON.stringify(address)).toMatch(/HADDR\[31:0\].*111=128 bytes.*00=IDLE/is);
      expect(JSON.stringify(address)).toMatch(/HPROT\[6:4\].*HNONSEC.*HEXCL \/ HMASTER/is);
      expect(JSON.stringify(address)).toMatch(/pending NONSEQ\/SEQ.*IDLE, BUSY, and first-ERROR-cycle exceptions/is);
      expect(JSON.stringify(htrans)).toMatch(/VALID HREADY.*ACCEPTED BEATS.*fixed-length INCR4 burst terminates/is);
      expect(JSON.stringify(htrans)).toMatch(/SINGLE cannot continue with BUSY/i);
      expect(JSON.stringify(burst)).toMatch(/111=128 bytes.*configured data-bus width.*Every AHB burst.*1 KB/is);
    });

    it('keeps response owner, wait, invalid-stimulus, and ERROR policy visuals exact', () => {
      const response = getVisualById('wf-ahb-read-write-response');
      const illegalHtrans = getVisualById('wf-ahb-illegal-htrans');
      const lanes = getVisualById('wf-ahb-hsize-byte-lanes');
      const wait = getVisualById('wf-ahb-wait-state-heavy');
      const error = getVisualById('wf-ahb-review-error');
      expect(JSON.stringify(response)).toMatch(/DATA OWNER.*HREADYOUT \(selected slave\).*HREADY \(global mux\).*ordinary wait.*HRESP=OKAY/is);
      expect(JSON.stringify(illegalHtrans)).toMatch(/pending valid SEQ.*ordinary OKAY wait.*IDLE, BUSY, and first-ERROR-cycle/is);
      expect(JSON.stringify(lanes)).toMatch(/invalid stimulus.*documented design policy.*no synthetic BLOCK/is);
      expect(JSON.stringify(lanes)).not.toMatch(/"BLOCK"/i);
      expect(JSON.stringify(wait)).toMatch(/HBURST.*HSIZE.*HWRITE.*SELECTED SLAVE.*HREADYOUT \(SRAM\)/is);
      expect(JSON.stringify(error)).toMatch(/CANCEL PATH HTRANS.*CONTINUE PATH HTRANS.*continuing the burst is also permitted/is);
    });

    it('separates lock, exclusive, security, and revision semantics in advanced visuals', () => {
      const lock = getVisualById('tl-ahb-locked-sequence');
      const exclusive = getVisualById('tl-ahb-exclusive');
      const security = getVisualById('topo-ahb-security-filter');
      const evolution = getVisualById('sig-ahb-evolution');
      expect(JSON.stringify(lock)).toMatch(/must not transfer.*ownership.*future grant/is);
      expect(JSON.stringify(lock)).toMatch(/applicable arbitration\/resource path/is);
      expect(JSON.stringify(exclusive)).toMatch(/HMASTER=3.*HEXOKAY=1.*HNONSEC.*Matching write/is);
      expect(JSON.stringify(exclusive)).toMatch(/unsupported.*Reset clears state/is);
      expect(JSON.stringify(exclusive)).toMatch(/HRESP=OKAY.*HEXOKAY=0.*memory is not updated/is);
      expect(JSON.stringify(security)).toMatch(/one legal architecture.*source firewall, interconnect, controller, or target.*must not leak secure read data.*no secure-state side effect/is);
      expect(JSON.stringify(evolution)).toMatch(/RETRY requests.*without HSPLITx.*SPLIT.*until.*HSPLITx/is);
      expect(JSON.stringify(evolution)).toMatch(/HMASTER\[3:0\].*HMASTER\[m:0\].*every AHB burst/is);
    });

    it('makes coverage legality revision-selectable and retains error beat positions', () => {
      const coverage = getVisualById('cm-ahb-burst-resp');
      if (!coverage || coverage.type !== 'coverage-map') throw new Error('Missing AHB coverage map');
      expect(coverage.configurations?.map(configuration => configuration.id)).toEqual(['lite-ahb5', 'original-ahb']);
      expect(coverage.yAxis.buckets).toEqual(['OKAY', 'ERROR', 'RETRY', 'SPLIT']);
      expect(coverage.configurations?.[0].illegalRows).toEqual(['RETRY', 'SPLIT']);
      expect(coverage.bins.filter(bin => bin.y === 'ERROR').every(bin => bin.errorBeatHits)).toBe(true);
      expect(coverage.bins.filter(bin => bin.y === 'RETRY').every(bin => !bin.illegal)).toBe(true);
    });

    it('keeps AHB exercises context-specific and configuration-aware', () => {
      expect(getExerciseById('ex-ahb-htrans-violation')?.prompt).toMatch(/ordinary HRESP=OKAY wait.*valid SEQ.*No IDLE, BUSY, or first-ERROR-cycle exception/is);
      expect(getExerciseById('ex-ahb-review-error')?.expectedTakeaway).toMatch(/permits.*cancel.*does not require cancellation/is);
      expect(getExerciseById('ex-ahb-coverage-holes')?.expectedTakeaway).toMatch(/span = 16.*wrap base.*same 1 KB.*accepted NONSEQ\/SEQ/is);
      expect(getExerciseById('ex-ahb-bounded-liveness')?.expectedTakeaway).toMatch(/configured service-contract result.*not by itself a universal AHB protocol-safety violation/is);
    });

    it('gives every AHB rule primary-source provenance and separates protocol from policy', () => {
      const ahbRules = specRulesData.rules.filter(rule => rule.protocol === 'ahb');
      expect(ahbRules.length).toBeGreaterThanOrEqual(10);
      for (const rule of ahbRules) {
        expect(rule.specification, rule.id).toMatch(/IHI 0011A|IHI 0033B\.b/i);
        expect(rule.sections?.length ?? 0, rule.id).toBeGreaterThan(0);
        expect(rule.requirementType, rule.id).toBeTruthy();
        expect(rule.sourceUrl, rule.id).toMatch(/^https:\/\/developer\.arm\.com\/documentation\/ihi00(?:11|33)/i);
      }
      expect(ahbRules.find(rule => rule.id === 'ahb-retry-response')?.statement).toMatch(/does not use HSPLITx/i);
      expect(ahbRules.find(rule => rule.id === 'ahb-split-response')?.statement).toMatch(/HSPLITx.*restores eligibility/i);
      expect(ahbRules.find(rule => rule.id === 'ahb-arbiter-starvation')?.requirementType).toBe('product-contract');
      expect(ahbRules.find(rule => rule.id === 'ahb-security-enforcement-policy')?.requirementType).toMatch(/system-policy/i);
    });
  });

  describe('R3 AXI P0 — architecture, channels, and handshake contract', () => {
    // IHI 0022H A3.1-A3.3: all channels share ACLK, each channel has a
    // source/destination handshake, and only the defined dependencies link them.
    it('teaches synchronous independently handshaken channels with explicit dependencies', () => {
      const overview = lessonBody('axi', 1);
      const channels = lessonBody('axi', 4);
      expect(overview).toMatch(/independently handshaken channels/i);
      expect(overview).toMatch(/synchronous to `ACLK`/i);
      expect(overview).toMatch(/accepted AR precedes its R data.*accepted AW plus the accepted final W beat precede `BVALID`/is);
      expect(channels).toMatch(/master sources AW, W, and AR.*slave sources B and R/is);
      expect(channels).toMatch(/AXI4.*W data.*write-address order/i);
      expect(channels).not.toMatch(/operate asynchronously relative/i);
      expect(channels).not.toMatch(/strictly sequential process/i);
    });

    // IHI 0022H A3.4 and B1 define revision/type-specific burst lengths and
    // permit AXI4-Lite outstanding traffic despite omitting IDs.
    it('keeps family capabilities and terminology exact', () => {
      const variants = lessonBody('axi', 2);
      const terms = lessonBody('axi', 3);
      expect(variants).toMatch(/WRAP.*exactly 2, 4, 8, or 16/is);
      expect(variants).toMatch(/AXI4-Lite.*permits multiple outstanding/is);
      expect(variants).toMatch(/fixed 32- or 64-bit data width/i);
      expect(variants).toMatch(/capabilities, not performance requirements/i);
      expect(terms).toMatch(/pre-address buffering\/association state/i);
      expect(terms).toMatch(/maximum byte count is `2\^AxSIZE`/i);
      expect(terms).toMatch(/not a globally unique transaction number/i);
    });

    // A3.2-A3.4 require source VALID independence, complete stalled-payload
    // stability, exact address controls, and response prerequisites.
    it('makes every AXI4 address, data, and response owner obligation explicit', () => {
      const aw = lessonBody('axi', 5);
      const w = lessonBody('axi', 6);
      const b = lessonBody('axi', 7);
      const ar = lessonBody('axi', 8);
      const r = lessonBody('axi', 9);
      expect(aw).toMatch(/byte address of the first transfer/i);
      expect(aw).toMatch(/assertion must not depend on `AWREADY`/i);
      expect(aw).toMatch(/Normal or Exclusive.*does not guarantee success/is);
      expect(w).toMatch(/destination is not required to accept early W/is);
      expect(w).toMatch(/`WUSER` when present.*stable/is);
      expect(w).toMatch(/asserted bit.*consistent with the byte lanes/is);
      expect(b).toMatch(/assertion must not depend on `BREADY`/i);
      expect(b).toMatch(/exclusive write that does not succeed returns `OKAY`.*does not update/is);
      expect(b).toMatch(/`BUSER` when present.*stable/is);
      expect(ar).toMatch(/assertion must not depend on `ARREADY`/i);
      expect(r).toMatch(/only after the corresponding AR request has been accepted/i);
      expect(r).toMatch(/`RUSER` when present.*stable/is);
      expect(r).toMatch(/accepted beat `ARLEN \+ 1`/i);
    });

    it('separates protocol attributes from configured system policy', () => {
      const body = lessonBody('axi', 10);
      expect(body).toMatch(/`AxCACHE\[0\]` indicates Bufferable.*`AxCACHE\[1\]` indicates Modifiable/is);
      expect(body).toMatch(/never removes the AXI4 prerequisite.*accept AW and the final W transfer/is);
      expect(body).toMatch(/`AxLOCK`.*do not turn a request into a mandatory global lock/is);
      expect(body).toMatch(/`AxUSER`.*system contract/is);
    });

    it('requires VALID persistence and no combinational interface paths without inventing liveness', () => {
      const handshake = lessonBody('axi', 11);
      const independence = lessonBody('axi', 12);
      expect(handshake).toMatch(/keep `VALID` HIGH across consecutive transfers/i);
      expect(handshake).toMatch(/no combinational path between any input and output signal/i);
      expect(handshake).toMatch(/safety assertions and bounded service contracts.*different obligations/is);
      expect(independence).toMatch(/can withhold `WREADY`/i);
      expect(independence).toMatch(/`BVALID` must not wait for `BREADY`.*`RVALID` must not wait for `RREADY`/is);
      expect(independence).toMatch(/AXI4 W data follows write-address order/i);
    });
  });

  describe('R3 AXI P0 — transaction state, ordering, and burst geometry', () => {
    it('models pre-AW data, accepted prerequisites, and accepted final retirement', () => {
      const write = lessonBody('axi', 13);
      const read = lessonBody('axi', 14);
      expect(write).toMatch(/pre-address data.*separate buffer/is);
      expect(write).toMatch(/associates W bursts.*AW order/is);
      expect(write).toMatch(/must not assert `BVALID` before accepted AW and accepted final W/i);
      expect(read).toMatch(/`RUSER` when present.*stable/is);
      expect(read).toMatch(/retires only on `RVALID && RREADY && RLAST`/i);
      expect(read).toMatch(/recovery is implementation-defined/i);
    });

    it('uses revision-aware exact length, type, address, and LAST rules', () => {
      const structure = lessonBody('axi', 15);
      const last = lessonBody('axi', 16);
      expect(structure).toMatch(/WRAP is exactly 2, 4, 8, or 16/i);
      expect(structure).toMatch(/Reserved \(0b11\).*Illegal/i);
      expect(structure).toMatch(/`wrapBytes=N×B`.*`lower=floor\(start\/wrapBytes\)×wrapBytes`/is);
      expect(last).toMatch(/stalled LAST remains asserted.*payload stable/i);
      expect(last).toMatch(/AXI3 has `WID`.*AXI4 removes `WID`/is);
      expect(last).toMatch(/malformed LAST never changes the declared beat count/i);
    });

    it('tracks reusable and remapped IDs with separate read and write counters', () => {
      const ids = lessonBody('axi', 17);
      const outstanding = lessonBody('axi', 18);
      expect(ids).toMatch(/per-ID issue queue/i);
      expect(ids).toMatch(/check both route ownership and restoration/i);
      expect(ids).toMatch(/AXI4-Lite.*multiple outstanding/is);
      expect(outstanding).toMatch(/Read and write depths.*per-ID limits.*interface capabilities/is);
      expect(outstanding).toMatch(/Accepted W data that precedes AW.*not counted as an accepted-address outstanding write/is);
      expect(outstanding).toMatch(/AR allocates a read.*accepted RLAST retires it.*AW allocates a write.*accepted B retires it/is);
    });

    it('scopes ordering by ID and destination without equating response with memory visibility', () => {
      const order = lessonBody('axi', 19);
      const reorder = lessonBody('axi', 20);
      expect(order).toMatch(/same ID.*same-channel destination\/ordering domain/is);
      expect(order).toMatch(/different IDs have no relative response-order guarantee/i);
      expect(order).toMatch(/B response.*not by itself a universal software memory barrier/is);
      expect(order).toMatch(/Bufferable transactions.*before the final destination/is);
      expect(reorder).toMatch(/permission, not a required scheduling policy/i);
      expect(reorder).toMatch(/Beats within each burst remain ordered/i);
      expect(reorder).toMatch(/response order does not reveal.*internal execution schedule/is);
    });

    it('separates local safety, configured liveness, and write-association resources', () => {
      const backpressure = lessonBody('axi', 21);
      const throughput = lessonBody('axi', 22);
      expect(backpressure).toMatch(/No additional W beat is accepted.*already offered.*remains stable/is);
      expect(backpressure).toMatch(/backpressure AW.*configured association or outstanding resources/is);
      expect(backpressure).toMatch(/configured service contract, not a universal AXI timing rule/i);
      expect(throughput).toMatch(/accepted-AW queue in issue order/i);
      expect(throughput).toMatch(/Early accepted W beats.*pre-AW buffer/i);
      expect(throughput).toMatch(/response reordering never changes AXI4 W association order/i);
    });

    it('derives burst addresses, byte lanes, and the exact 4 KB final byte', () => {
      const burst = lessonBody('axi', 23);
      const lanes = lessonBody('axi', 24);
      const boundary = lessonBody('axi', 25);
      expect(burst).toMatch(/`AxBURST=0b11` is reserved/i);
      expect(burst).toMatch(/Every burst type obeys the 4 KB boundary rule/i);
      expect(lanes).toMatch(/asserted `WSTRB` bits must stay within the legal byte-lane mask/i);
      expect(lanes).toMatch(/Reads have no `RSTRB`/i);
      expect(lanes).toMatch(/protocol-illegal stimulus.*legal request.*configured target does not support/is);
      expect(boundary).toMatch(/`endExclusive=start\+beats×bytesPerBeat`/i);
      expect(boundary).toMatch(/final transferred byte is `0x1007`/i);
      expect(boundary).toMatch(/virtual-memory page faults are not an AXI response mechanism/i);
    });

    it('consolidates revision-aware legal and illegal patterns', () => {
      const body = lessonBody('axi', 26);
      expect(body).toMatch(/combinational path from interface input signals to interface outputs/i);
      expect(body).toMatch(/slave keeps `WREADY` LOW.*early W acceptance is permitted, not required/is);
      expect(body).toMatch(/all `WSTRB` bits LOW.*LAST\/count obligations remain/is);
      expect(body).toMatch(/AXI3:.*`WID`.*AXI4:.*`WID` is removed/is);
      expect(body).toMatch(/AXI3.*does not add the AXI4 AW-handshake prerequisite/is);
    });
  });

  describe('R3 AXI P0 — shared visual, exercise, and rule integrity', () => {
    it('keeps channel visuals complete under backpressure and early-W policy aware', () => {
      const topology = getVisualById('topo-axi-five-channels');
      const write = getVisualById('wf-axi-write-channels');
      const read = getVisualById('wf-axi-read-channels');
      expect(topology?.description).toMatch(/synchronous ACLK.*AR→R.*AW\+final-W→B/i);
      expect(JSON.stringify(topology)).toMatch(/may withhold WREADY.*BVALID must not depend on BREADY/is);
      expect(JSON.stringify(write)).toMatch(/chooses to accept and buffer W before AW.*destination may instead withhold WREADY/is);
      expect(JSON.stringify(write)).toMatch(/WUSER.*BUSER/i);
      expect(JSON.stringify(read)).toMatch(/RUSER.*complete.*payload.*stable/is);
    });

    it('keeps address, sideband, legality, and boundary explorers exact', () => {
      const address = getVisualById('sig-axi-address-channels');
      const sideband = getVisualById('sig-axi-sideband-attributes');
      const legality = getVisualById('sig-axi-legality-patterns');
      const boundary = getVisualById('wf-axi-4kb-boundary');
      expect(JSON.stringify(address)).toMatch(/WRAP exactly 2, 4, 8, or 16/is);
      expect(JSON.stringify(sideband)).toMatch(/AxLOCK.*does not mandate a global lock.*AxUSER.*Stable while stalled/is);
      expect(JSON.stringify(legality)).toMatch(/Early W policy.*slave may withhold WREADY.*Interface timing.*no combinational paths/is);
      expect(JSON.stringify(boundary)).toMatch(/Beat B1 at 0x0FFC.*final byte is 0x0FFF.*Beat B2 starts at 0x1000/is);
    });

    it('makes exercises state destination policy and ordering scope', () => {
      expect(getExerciseById('ex-axi-channels-2')?.expectedTakeaway).toMatch(/destination may withhold WREADY.*BVALID still waits/is);
      expect(getExerciseById('ex-axi-ordering')?.prompt).toMatch(/same destination and ordering domain/i);
      expect(getExerciseById('ex-axi-ordering')?.expectedTakeaway).toMatch(/permitted, not required/i);
      expect(getExerciseById('lab-axi-write-response-prerequisites')?.expectedTakeaway).toMatch(/destination can refuse early W.*cannot depend on BREADY/is);
      expect(getExerciseById('ex-axi-4kb-calc')?.expectedTakeaway).toMatch(/0x100F.*0x1010.*end-exclusive/i);
    });

    it('gives every AXI rule primary-source provenance and labels policy', () => {
      const axiRules = specRulesData.rules.filter(rule => rule.protocol === 'axi');
      expect(axiRules.length).toBeGreaterThanOrEqual(10);
      for (const rule of axiRules) {
        expect(rule.specification, rule.id).toMatch(/IHI 0022H/i);
        expect(rule.sections?.length ?? 0, rule.id).toBeGreaterThan(0);
        expect(rule.requirementType, rule.id).toBeTruthy();
        expect(rule.sourceUrl, rule.id).toMatch(/^https:\/\/developer\.arm\.com\/documentation\/ihi0022\/h/i);
      }
      expect(axiRules.find(rule => rule.id === 'axi-early-write-data-association')?.statement).toMatch(/not required to accept.*AXI4 has no WID/is);
      expect(axiRules.find(rule => rule.id === 'axi-four-kilobyte-boundary')?.statement).toMatch(/endExclusive-1.*not virtual-memory/is);
      expect(axiRules.find(rule => rule.id === 'axi-circular-backpressure')?.requirementType).toMatch(/product-liveness/i);
    });
  });

  describe('R4 P1 — executable checker and traceability models', () => {
    const modelIds = [
      'model-foundation-dv',
      'model-ahb-core-checker',
      'model-ahb-system-checker',
      'model-ahb-dv-rigor',
      'model-axi-write-checker',
      'model-axi-read-checker',
      'model-axi-burst-checker',
      'model-signoff-traceability',
    ];

    it('gives every P1 package executable scenarios, typed checks, and reviewable evidence', () => {
      for (const id of modelIds) {
        const model = checkerModel(id);
        expect(model.learnerQuestion, id).toMatch(/\?/);
        expect(model.protocolScope, id).toBeTruthy();
        expect(model.scenarios.length, id).toBeGreaterThanOrEqual(2);
        expect(model.scenarios.some(scenario => scenario.mode === 'negative' || scenario.mode === 'policy'), id).toBe(true);

        const scenarioIds = model.scenarios.map(scenario => scenario.id);
        expect(new Set(scenarioIds).size, `${id} scenario IDs`).toBe(scenarioIds.length);
        for (const scenario of model.scenarios) {
          const stepIds = scenario.steps.map(step => step.id);
          expect(new Set(stepIds).size, `${id}/${scenario.id} step IDs`).toBe(stepIds.length);
          expect(scenario.steps.every(step => step.checks.length > 0), `${id}/${scenario.id}`).toBe(true);
        }

        expect(model.traceability.length, id).toBeGreaterThan(0);
        for (const row of model.traceability) {
          expect(row.evidence, id).toMatch(/^artifact:\/\//);
          expect(row.owner, id).toBeTruthy();
          expect(row.configuration, id).toBeTruthy();
          expect(row.lastRegression, id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
          expect(row.reviewer, id).toBeTruthy();
        }
      }
    });

    it('keeps legal generation, intentional negative testing, and configured limits separate', () => {
      const foundation = checkerModel('model-foundation-dv');
      expect(JSON.stringify(foundation)).toMatch(/legal constrained-random/i);
      expect(JSON.stringify(foundation)).toMatch(/intentional negative/i);
      expect(JSON.stringify(foundation)).toMatch(/maxOutstanding.*product-contract/is);
      expect(lessonBody('foundations', 6)).toContain('(visual:model-foundation-dv)');
    });

    it('models AHB accepted phases, routed response ownership, formal vacuity, and configured bins', () => {
      const core = checkerModel('model-ahb-core-checker');
      const system = checkerModel('model-ahb-system-checker');
      const rigor = checkerModel('model-ahb-dv-rigor');
      expect(JSON.stringify(core)).toMatch(/visibleAddress.*acceptedBeats.*dataOwner.*1 KB/is);
      expect(JSON.stringify(core)).toMatch(/ERROR1.*ERROR2/is);
      expect(JSON.stringify(system)).toMatch(/acceptedTarget.*dataResponseOwner.*bridgeOccupancy/is);
      expect(JSON.stringify(system)).toMatch(/lockOwner.*exclusiveMonitor.*securityDecision/is);
      expect(JSON.stringify(rigor)).toMatch(/acceptedTriggerCount.*activeObligations.*postResetCoverHits/is);
      expect(JSON.stringify(rigor)).toMatch(/legalBins.*illegalBins.*ignoreBins/is);
      expect(lessonBody('ahb', 16)).toContain('(visual:model-ahb-core-checker)');
      expect(lessonBody('ahb', 20)).toContain('(visual:model-ahb-system-checker)');
      expect(lessonBody('ahb', 32)).toContain('(visual:model-ahb-dv-rigor)');
    });

    it('models AXI revision-aware association, per-ID retirement, lane legality, and exact boundaries', () => {
      const write = checkerModel('model-axi-write-checker');
      const read = checkerModel('model-axi-read-checker');
      const burst = checkerModel('model-axi-burst-checker');
      expect(JSON.stringify(write)).toMatch(/preAwWBuffer.*AXI4 AW order.*AXI3 WID.*responseUnderflow/is);
      expect(JSON.stringify(write)).toMatch(/WLAST exact accepted beat/is);
      expect(JSON.stringify(read)).toMatch(/perId0Queue.*perId1Queue.*readOutstanding.*writeOutstanding/is);
      expect(JSON.stringify(read)).toMatch(/expectedData.*observedData/is);
      expect(JSON.stringify(read)).toMatch(/restoredRoutes/i);
      expect(JSON.stringify(read)).toMatch(/sourceOwners/i);
      expect(JSON.stringify(burst)).toMatch(/wrapBase.*activeLanes.*observedWstrb.*endExclusive.*finalByte/is);
      expect(JSON.stringify(burst)).toMatch(/splitCount.*transactions/is);
      expect(burst.calculator).toMatchObject({ protocol: 'axi', boundaryBytes: 4096 });
      expect(checkerModel('model-ahb-core-checker').calculator).toMatchObject({ protocol: 'ahb', boundaryBytes: 1024 });
      expect(lessonBody('axi', 13)).toContain('(visual:model-axi-write-checker)');
      expect(lessonBody('axi', 18)).toContain('(visual:model-axi-read-checker)');
      expect(lessonBody('axi', 25)).toContain('(visual:model-axi-burst-checker)');
    });

    it('requires owner, configuration, regression, reviewer, and waiver governance at signoff', () => {
      const signoff = checkerModel('model-signoff-traceability');
      expect(JSON.stringify(signoff)).toMatch(/artifactUri.*owner.*configuration.*lastRegression.*reviewer/is);
      expect(JSON.stringify(signoff)).toMatch(/zero-hit.*mappedTest.*bad-waiver.*waiverAccepted/is);
      expect(lessonBody('ahb', 35)).toContain('(visual:model-signoff-traceability)');
      expect(lessonBody('axi', 40)).toContain('(visual:model-signoff-traceability)');
    });
  });

  describe('R5 P2 — selectable scenario and calculator completion', () => {
    it('adds selectable Foundation topology/sampling modes without conflating policy and protocol', () => {
      const scenarios = checkerModel('model-foundation-dv').scenarios;
      expect(scenarios.map(scenario => scenario.id)).toEqual(expect.arrayContaining([
        'crossbar-resource-contention', 'sampling-evidence-classification',
      ]));
      expect(JSON.stringify(scenarios)).toMatch(/different targets.*same target.*overlapping decode/is);
      expect(JSON.stringify(scenarios)).toMatch(/simulation X.*does not prove.*metastability/is);
      expect(JSON.stringify(getVisualById('tp-bus-architectures'))).toMatch(/same-target requests.*arbitration/is);
      expect(JSON.stringify(getVisualById('wf-signal-sampling'))).toMatch(/setup.*hold.*metastab/is);
    });

    it('adds AHB core BUSY/wait/reset state and an editable 1 KB calculator configuration', () => {
      const core = checkerModel('model-ahb-core-checker');
      expect(core.scenarios.map(scenario => scenario.id)).toContain('busy-wait-and-reset');
      expect(JSON.stringify(core)).toMatch(/BUSY is not a transfer.*pending valid.*monitor.*scoreboard/is);
      expect(core.calculator).toMatchObject({ protocol: 'ahb', boundaryBytes: 1024 });
      expect(core.calculator?.burstOptions).toEqual(['INCR', 'WRAP']);
      expect(JSON.stringify(getVisualById('wf-ahb-hsize-byte-lanes'))).toMatch(/active write-data lanes/i);
    });

    it('adds AHB ownership, matrix-concurrency, policy, bridge, mechanism, formal, and signoff modes', () => {
      const system = checkerModel('model-ahb-system-checker');
      const rigor = checkerModel('model-ahb-dv-rigor');
      const signoff = checkerModel('model-signoff-traceability');
      expect(system.scenarios.map(scenario => scenario.id)).toContain('arbitration-and-matrix-policy');
      expect(JSON.stringify(system)).toMatch(/Future grant.*ownership.*Different targets.*fairness bound/is);
      expect(JSON.stringify(system)).toMatch(/bridgeOccupancy.*lockOwner.*exclusiveMonitor.*securityDecision/is);
      expect(JSON.stringify(rigor)).toMatch(/vacuous.*reset.*legalBins.*illegalBins.*ignoreBins/is);
      expect(JSON.stringify(signoff)).toMatch(/zero-hit.*waiver/is);
    });

    it('provides every required AXI write order/stall mode and exact response state', () => {
      const write = checkerModel('model-axi-write-checker');
      expect(write.scenarios.map(scenario => scenario.id)).toEqual(expect.arrayContaining([
        'axi4-aw-first', 'axi4-w-first', 'axi4-simultaneous', 'independent-write-stalls',
        'axi3-wid-interleave', 'response-underflow',
      ]));
      expect(JSON.stringify(write)).toMatch(/AW allocates.*preAwWBuffer.*AXI4 AW order.*AXI3 WID/is);
      expect(JSON.stringify(write)).toMatch(/AWVALID held.*WVALID payload held.*BVALID held/is);
      expect(JSON.stringify(write)).toMatch(/B response.*underflow/is);
    });

    it('provides read gaps/backpressure/LAST failures plus legal and corrupt per-ID completion', () => {
      const read = checkerModel('model-axi-read-checker');
      expect(read.scenarios.map(scenario => scenario.id)).toEqual(expect.arrayContaining([
        'read-gaps-and-backpressure', 'early-rlast', 'different-id-reorder', 'same-id-corruption', 'id-restore',
      ]));
      expect(JSON.stringify(read)).toMatch(/R gap.*complete R payload.*accepted RLAST/is);
      expect(JSON.stringify(read)).toMatch(/first failing accepted edge.*implementation-defined/is);
      expect(JSON.stringify(read)).toMatch(/different-ID.*same-ID.*restor/is);
    });

    it('configures a live AXI FIXED/INCR/WRAP, lane, WSTRB, LAST, and 4 KB split calculator', () => {
      const burst = checkerModel('model-axi-burst-checker');
      expect(burst.calculator).toMatchObject({
        kind: 'burst-address', protocol: 'axi', boundaryBytes: 4096,
        burstOptions: ['FIXED', 'INCR', 'WRAP'],
      });
      expect(burst.calculator?.beatOptions).toEqual([1, 2, 4, 8, 16]);
      expect(JSON.stringify(burst)).toMatch(/WRAP.*unaligned.*WSTRB.*LAST.*4 KB/is);
    });
  });
});
