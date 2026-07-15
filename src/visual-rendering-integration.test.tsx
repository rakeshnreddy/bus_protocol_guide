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
    expect(screen.getByText(/after accepting the write address and the final write-data beat/i))
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
