import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LessonRenderer from './components/LessonRenderer';
import VisualRenderer from './components/visuals/VisualRenderer';
import { getLessons } from './lib/loaders';
import { getVisualById } from './lib/visualLoaders';

const representativeExistingVisualIds = [
  'wf-ahb-reset',
  'wf-ahb-simple-transfer',
  'wf-ahb-incr4-burst',
  'wf-ahb-wrap4-burst',
  'wf-ahb-pipelined-sequence',
  'wf-ahb-wait-state',
  'tl-ahb-exclusive',
  'sig-ahb-full',
  'topo-ahb-multi-master',
  'wf-axi-write-channels',
  'wf-axi-read-channels',
  'wf-axi-ids-correlation',
  'wf-axi-deadlock',
  'wf-axi-debug-wlast',
] as const;

const batchOneVisualIds = [
  'tp-basic-ahb',
  'sig-ahb-variants',
  'topo-ahb-terminology-map',
  'wf-ahb-reset',
  'sig-ahb-address-control',
  'wf-ahb-htrans-sequences',
  'sig-ahb-burst-size',
  'wf-ahb-read-write-response',
  'sig-ahb-access-attributes',
] as const;

const batchTwoVisualIds = [
  'wf-ahb-simple-transfer',
  'wf-ahb-illegal-htrans',
  'wf-ahb-incr4-burst',
  'sig-ahb-burst-size',
  'wf-ahb-wrap4-burst',
  'wf-ahb-hsize-byte-lanes',
  'wf-ahb-pipelined-sequence',
  'wf-ahb-wait-state-heavy',
  'tl-ahb-performance-comparison',
] as const;

const batchThreeChangedVisualIds = [
  'wf-ahb-arbitration-handover',
  'tl-ahb-multi-master-contention',
  'tl-ahb-locked-sequence',
  'wf-ahb-review-error',
  'tl-ahb-exclusive',
  'topo-ahb-security-filter',
  'sig-ahb-evolution',
] as const;

const batchFourChangedVisualIds = [
  'topo-ahb-dv-environment',
  'sig-ahb-assertion-library',
  'cm-ahb-burst-resp',
  'fp-ahb-hready-liveness',
  'wf-ahb-bug-wait-state',
  'wf-ahb-bug-decoder-glitch',
  'sig-ahb-signoff-evidence',
  'sig-ahb-full',
  'sig-ahb-senior-recap',
] as const;

const axiBatchOneChangedVisualIds = [
  'topo-axi-five-channels',
  'sig-axi-variants',
  'topo-axi-terminology-map',
  'sig-axi-address-channels',
  'wf-axi-write-channels',
  'wf-axi-ids-correlation',
  'wf-axi-read-channels',
  'sig-axi-sideband-attributes',
  'wf-axi-ready-valid-scenarios',
] as const;

const axiBatchTwoChangedVisualIds = [
  'wf-axi-write-channels',
  'wf-axi-read-channels',
  'tl-axi-burst-address-progression',
  'wf-axi-debug-wlast',
  'wf-axi-ids-correlation',
  'tp-axi-crossbar',
  'tl-axi-outstanding-window',
  'wf-axi-in-order',
  'wf-axi-out-of-order',
  'wf-axi-ready-valid-scenarios',
  'wf-axi-deadlock',
  'wf-axi-throughput',
] as const;

const axiBatchThreeChangedVisualIds = [
  'tl-axi-burst-address-progression',
  'wf-axi-alignment-byte-lanes',
  'wf-axi-4kb-boundary',
  'sig-axi-legality-patterns',
  'tl-axi3-axi4-write-order',
  'sig-axi4-lite-interface',
  'wf-axi-stream',
  'tp-axi-crossbar',
  'tl-axi-qos-arbitration',
  'tp-axi-apb-bridge',
] as const;

const axiBatchFourChangedVisualIds = [
  'topo-axi-dv-environment',
  'sig-axi-assertion-library',
  'cm-axi-burst-resp',
  'fp-axi-wlast-exact',
  'wf-axi-out-of-order',
  'wf-axi-debug-wlast',
  'wf-axi-deadlock',
  'spec-rule-explorer-axi',
  'sig-axi-signoff-evidence',
  'axi-signal-ref',
  'tl-axi-ordering-review',
  'wf-axi-throughput',
  'sig-axi-senior-recap',
] as const;

const auditCheckerModelIds = [
  'model-foundation-dv',
  'model-ahb-core-checker',
  'model-ahb-system-checker',
  'model-ahb-dv-rigor',
  'model-axi-write-checker',
  'model-axi-read-checker',
  'model-axi-burst-checker',
  'model-signoff-traceability',
] as const;

function renderProductionVisual(id: string) {
  const visual = getVisualById(id);
  if (!visual) throw new Error(`Missing production visual '${id}'`);

  render(
    <MemoryRouter>
      <VisualRenderer visualRef={{ id, type: visual.type, dataFile: '' }} />
    </MemoryRouter>,
  );

  expect(screen.getByRole('heading', { name: visual.title })).toBeInTheDocument();
  expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/Unknown visual type/i)).not.toBeInTheDocument();
}

describe('production visual rendering', () => {
  it.each(representativeExistingVisualIds)('renders recovered visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(batchOneVisualIds)('renders AHB Batch 1 visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(batchTwoVisualIds)('renders AHB Batch 2 visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(batchThreeChangedVisualIds)('renders AHB Batch 3 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(batchFourChangedVisualIds)('renders AHB Batch 4 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(axiBatchOneChangedVisualIds)('renders AXI Batch 1 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(axiBatchTwoChangedVisualIds)('renders AXI Batch 2 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(axiBatchThreeChangedVisualIds)('renders AXI Batch 3 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(axiBatchFourChangedVisualIds)('renders AXI Batch 4 changed visual %s', id => {
    renderProductionVisual(id);
  });

  it.each(auditCheckerModelIds)('renders audit checker model %s through the production renderer', id => {
    renderProductionVisual(id);
  });

  it('keeps dense visual types inside mobile-safe horizontal scroll containers', () => {
    renderProductionVisual('wf-ahb-htrans-sequences');
    expect(document.querySelector('.waveform-scroll')).toHaveStyle({ overflowX: 'auto' });
  });

  it('exposes the Batch 2 alignment violation through keyboard cycle inspection', () => {
    renderProductionVisual('wf-ahb-hsize-byte-lanes');
    const cycle = screen.getByRole('button', { name: 'Inspect cycle 5' });
    cycle.focus();
    fireEvent.keyDown(cycle, { key: 'Enter' });
    expect(screen.getByText(/Halfword transfer at 0x01 is not aligned/i)).toBeInTheDocument();
  });

  it('explains performance phases when a timeline control receives focus', () => {
    renderProductionVisual('tl-ahb-performance-comparison');
    const beat = screen.getByRole('button', {
      name: 'Zero-wait INCR4: B2 done, cycles 3 to 4',
    });
    fireEvent.focus(beat);
    expect(screen.getByText(/pipeline completes one beat every cycle/i)).toBeInTheDocument();
  });

  it('explains why a grant is not yet ownership during a stalled handover', () => {
    renderProductionVisual('wf-ahb-arbitration-handover');
    const stalledCycle = screen.getByRole('button', { name: 'Inspect cycle 3' });
    stalledCycle.focus();
    fireEvent.keyDown(stalledCycle, { key: 'Enter' });
    expect(screen.getByText(/HREADY is LOW.*CPU remains HMASTER/i)).toBeInTheDocument();
  });

  it('explains a blocked requester from the locked-sequence timeline', () => {
    renderProductionVisual('tl-ahb-locked-sequence');
    const blockedRequest = screen.getByRole('button', {
      name: 'DMA request: Request blocked, cycles 2 to 5',
    });
    fireEvent.focus(blockedRequest);
    expect(screen.getByText(/must not transfer ownership/i)).toBeInTheDocument();
  });

  it('supports keyboard inspection of the denied AHB5 security path', () => {
    renderProductionVisual('topo-ahb-security-filter');
    const deniedRoute = screen.getByRole('button', { name: /Inspect route deny → ERROR/i });
    fireEvent.focus(deniedRoute);
    fireEvent.keyDown(deniedRoute, { key: 'Enter' });
    expect(screen.getByText(/must not leak secure read data/i)).toBeInTheDocument();
  });

  it('reveals the version-correct 1 KB rule in the evolution explorer', () => {
    renderProductionVisual('sig-ahb-evolution');
    fireEvent.click(screen.getByRole('button', { name: /1 KB boundary/i }));
    expect(screen.getByText(/Original AMBA 2 AHB and AHB-Lite\/AHB5 all require/i)).toBeInTheDocument();
  });

  it('supports keyboard inspection along the Batch 4 verification evidence path', async () => {
    const user = userEvent.setup();
    renderProductionVisual('topo-ahb-dv-environment');
    const scoreboard = screen.getByRole('button', { name: /Inspect.*Scoreboard/i });
    act(() => scoreboard.focus());
    await user.keyboard('{Enter}');
    expect(screen.getByText(/Expected and actual paths must remain independent/i)).toBeInTheDocument();
  });

  it('reveals the protocol exception behind undefined-length INCR termination', () => {
    renderProductionVisual('sig-ahb-assertion-library');
    fireEvent.click(screen.getByRole('button', { name: /Transfer-type legality/i }));
    expect(screen.getByText(/undefined-length INCR may terminate/i)).toBeInTheDocument();
  });

  it('persists coverage-bin selection from the keyboard', async () => {
    const user = userEvent.setup();
    renderProductionVisual('cm-ahb-burst-resp');
    const bin = screen.getByRole('button', { name: /INCR4.*ERROR/i });
    act(() => bin.focus());
    await user.keyboard('{Enter}');
    expect(bin).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/INCR4.*ERROR/i);
  });

  it('opens the signoff evidence for stalled-transfer safety', () => {
    renderProductionVisual('sig-ahb-signoff-evidence');
    fireEvent.click(screen.getByRole('button', { name: /Wait-state behavior/i }));
    expect(screen.getByText(/green property report/i)).toBeInTheDocument();
  });

  it('supports keyboard inspection of the AXI write-response dependency path', async () => {
    const user = userEvent.setup();
    renderProductionVisual('topo-axi-five-channels');
    const responseLane = screen.getByRole('button', { name: /Inspect route B ← write response/i });
    act(() => responseLane.focus());
    await user.keyboard('{Enter}');
    expect(responseLane).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/after accepted AW plus accepted final W/i))
      .toBeInTheDocument();
  });

  it('reveals the AXI4-Lite outstanding-transaction nuance', () => {
    renderProductionVisual('sig-axi-variants');
    fireEvent.click(screen.getByRole('button', { name: /AXI4-Lite/i }));
    expect(screen.getByText(/Multiple transactions may still be outstanding/i)).toBeInTheDocument();
  });

  it('marks the early VALID withdrawal through keyboard cycle inspection', () => {
    renderProductionVisual('wf-axi-ready-valid-scenarios');
    const cycle = screen.getByRole('button', { name: 'Inspect cycle 9' });
    cycle.focus();
    fireEvent.keyDown(cycle, { key: ' ' });
    expect(cycle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/VALID dropped before handshake/i)).toBeInTheDocument();
  });

  it('explains the AXI WRAP boundary from a keyboard-focused burst phase', () => {
    renderProductionVisual('tl-axi-burst-address-progression');
    const wrap = screen.getByRole('button', {
      name: 'WRAP4 · start 0x100C: B1 · 0x1000, cycles 2 to 3',
    });
    fireEvent.focus(wrap);
    expect(wrap).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/wraps to the lower boundary 0x1000/i)).toBeInTheDocument();
  });

  it('reveals same-ID reuse in the outstanding scoreboard timeline', () => {
    renderProductionVisual('tl-axi-outstanding-window');
    const allocation = screen.getByRole('button', {
      name: 'Read C · ID 0: AR accepted, cycles 3 to 4',
    });
    fireEvent.focus(allocation);
    expect(screen.getByText(/Reusing an ID is legal/i)).toBeInTheDocument();
  });

  it('exposes early WLAST from keyboard cycle inspection', () => {
    renderProductionVisual('wf-axi-debug-wlast');
    const cycle = screen.getByRole('button', { name: 'Inspect cycle 4' });
    cycle.focus();
    fireEvent.keyDown(cycle, { key: 'Enter' });
    expect(cycle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/WLAST asserted before accepted beat count/i)).toBeInTheDocument();
  });

  it('reveals the byte-lane transition after an unaligned AXI start', () => {
    renderProductionVisual('wf-axi-alignment-byte-lanes');
    const cycle = screen.getByRole('button', { name: 'Inspect cycle 5' });
    cycle.focus();
    fireEvent.keyDown(cycle, { key: 'Enter' });
    expect(cycle).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/next INCR transfer address is aligned to 0x1004/i)).toBeInTheDocument();
  });

  it('opens the accepted-transfer response dependency in the legality debugger', () => {
    renderProductionVisual('sig-axi-legality-patterns');
    fireEvent.click(screen.getByRole('button', { name: /B response/i }));
    expect(screen.getByText(/accepted the write address and accepted the final write-data transfer/i))
      .toBeInTheDocument();
  });

  it('compares AXI3 WID interleaving with AXI4 address-order association', () => {
    renderProductionVisual('tl-axi3-axi4-write-order');
    const beat = screen.getByRole('button', { name: /AXI4 W channel: A1 · WLAST/i });
    fireEvent.focus(beat);
    expect(screen.getByText(/All data for A completes before any data for B/i)).toBeInTheDocument();
  });

  it('reveals that AXI4-Lite retains protection attributes', () => {
    renderProductionVisual('sig-axi4-lite-interface');
    fireEvent.click(screen.getByRole('button', { name: /AW channel/i }));
    expect(screen.getByText(/AWPROT is part of the permitted AXI4-Lite signal set/i)).toBeInTheDocument();
  });

  it('holds the AXI4-Stream final packet beat during keyboard-inspected backpressure', () => {
    renderProductionVisual('wf-axi-stream');
    const cycle = screen.getByRole('button', { name: 'Inspect cycle 4' });
    cycle.focus();
    fireEvent.keyDown(cycle, { key: ' ' });
    expect(screen.getByText(/final beat is offered with TLAST=1.*TREADY is LOW/i)).toBeInTheDocument();
  });

  it('explains why QoS cannot bypass a same-ID ordering dependency', () => {
    renderProductionVisual('tl-axi-qos-arbitration');
    const blocked = screen.getByRole('button', { name: /Younger same-ID read.*Order blocked/i });
    fireEvent.focus(blocked);
    expect(screen.getByText(/cannot overtake an older same-ID transaction/i)).toBeInTheDocument();
  });

  it('supports keyboard inspection of the AXI-to-APB error-return route', () => {
    renderProductionVisual('tp-axi-apb-bridge');
    const route = screen.getByRole('button', { name: /Inspect route PSEL\/PENABLE.*PSLVERR/i });
    route.focus();
    fireEvent.keyDown(route, { key: 'Enter' });
    expect(route).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/APB3 and later can return PSLVERR/i)).toBeInTheDocument();
  });

  it('supports keyboard inspection of the AXI per-ID scoreboard evidence path', async () => {
    const user = userEvent.setup();
    renderProductionVisual('topo-axi-dv-environment');
    const scoreboard = screen.getByRole('button', { name: /Inspect.*Reference Model.*Scoreboard/i });
    act(() => scoreboard.focus());
    await user.keyboard('{Enter}');
    expect(scoreboard).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/Match BID and RID.*preserve issue order within each ID/i))
      .toBeInTheDocument();
  });

  it('opens the configured-liveness boundary in the AXI assertion explorer', () => {
    renderProductionVisual('sig-axi-assertion-library');
    fireEvent.click(screen.getByRole('button', { name: /Bounded progress contract/i }));
    expect(screen.getByText(/Base AXI does not impose one finite READY or response-latency bound/i))
      .toBeInTheDocument();
  });

  it('selects conditional EXOKAY coverage without labeling FIXED as illegal', () => {
    renderProductionVisual('cm-axi-burst-resp');
    const bin = screen.getByRole('button', { name: /FIXED by EXOKAY: coverage hole, zero hits/i });
    fireEvent.click(bin);
    expect(bin).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('status')).toHaveTextContent(/Conditional coverage hole.*AxLOCK/i);
  });

  it('lets the formal playground expose early WLAST on accepted beat three', () => {
    renderProductionVisual('fp-axi-wlast-exact');
    fireEvent.click(screen.getByTestId('interaction-WLAST-4'));
    expect(screen.getByText('FAIL (Property Violation)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Inspect cycle 4' }));
    expect(screen.getByText(/WLAST is asserted early.*beat 3/i)).toBeInTheDocument();
  });

  it('opens per-ID signoff evidence from a keyboard-sized explorer control', () => {
    renderProductionVisual('sig-axi-signoff-evidence');
    const control = screen.getByRole('button', { name: /ID and ordering/i });
    fireEvent.click(control);
    expect(control).toHaveStyle({ minHeight: '52px' });
    expect(screen.getByText(/ID selects the ordering stream but is not the expected address or data itself/i))
      .toBeInTheDocument();
  });

  it('reveals the exact AXI4 BVALID prerequisites in the signal reference', () => {
    renderProductionVisual('axi-signal-ref');
    fireEvent.click(screen.getByRole('button', { name: /BVALID/i }));
    expect(screen.getByText(/do not assert before an AW handshake and the accepted WLAST transfer/i))
      .toBeInTheDocument();
  });

  it('flags the first younger same-ID response in the ordering timeline', () => {
    renderProductionVisual('tl-axi-ordering-review');
    const phase = screen.getByRole('button', { name: /Illegal response B-C-A: B · ID 5.*cycles 4 to 5/i });
    fireEvent.focus(phase);
    expect(phase).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/head of that ID's outstanding queue is still A/i)).toBeInTheDocument();
  });

  it('opens the protocol-versus-product distinction in the AXI senior recap', () => {
    renderProductionVisual('sig-axi-senior-recap');
    fireEvent.click(screen.getByRole('button', { name: /Is every long stall a violation/i }));
    expect(screen.getByText(/does not provide one universal finite READY or response-latency bound/i))
      .toBeInTheDocument();
  });
});

describe('AHB Batch 1 lesson rendering', () => {
  it.each(Array.from({ length: 9 }, (_, index) => index + 1))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'ahb' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AHB lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AHB Batch 2 lesson rendering', () => {
  it.each(Array.from({ length: 9 }, (_, index) => index + 10))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'ahb' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AHB lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AHB Batch 3 lesson rendering', () => {
  it.each(Array.from({ length: 10 }, (_, index) => index + 19))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'ahb' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AHB lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AHB Batch 4 lesson rendering', () => {
  it.each(Array.from({ length: 10 }, (_, index) => index + 29))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'ahb' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AHB lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AXI Batch 1 lesson rendering', () => {
  it.each(Array.from({ length: 11 }, (_, index) => index + 1))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'axi' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AXI lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AXI Batch 2 lesson rendering', () => {
  it.each(Array.from({ length: 11 }, (_, index) => index + 12))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'axi' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AXI lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AXI Batch 3 lesson rendering', () => {
  it.each(Array.from({ length: 11 }, (_, index) => index + 23))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'axi' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AXI lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getByRole('heading', { level: 1, name: lessonContent.lesson.title }))
        .toBeInTheDocument();
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});

describe('AXI Batch 4 lesson rendering', () => {
  it.each(Array.from({ length: 11 }, (_, index) => index + 34))(
    'renders lesson %i with all declared visuals and captions',
    order => {
      const lessonContent = getLessons().find(({ lesson }) =>
        lesson.protocol === 'axi' && lesson.order === order,
      );
      if (!lessonContent) throw new Error(`Missing AXI lesson ${order}`);

      render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );

      expect(screen.getAllByRole('heading', { level: 1, name: lessonContent.lesson.title }).length)
        .toBeGreaterThan(0);
      expect(screen.queryByText(/Visual not found/i)).not.toBeInTheDocument();
      expect(document.querySelectorAll('.inline-visual-wrapper'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
      expect(document.querySelectorAll('.inline-visual-caption'))
        .toHaveLength(lessonContent.lesson.visualIds.length);
    },
  );
});
