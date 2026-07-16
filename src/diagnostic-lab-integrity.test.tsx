import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import InteractiveExercise from './components/interactive/InteractiveExercise';
import LessonRenderer from './components/LessonRenderer';
import { getExerciseById, getExercises, getLessonById, getLessons } from './lib/loaders';
import type { DiagnosticLabExercise } from './types/content';

const expectedLabLessons = new Map([
  ['lab-ahb-pipeline-owner', '15_address_data_phase'],
  ['lab-ahb-stall-stability', '16_wait_states_hready'],
  ['lab-ahb-error-completion', '24_error_responses'],
  ['lab-ahb-configured-liveness', '32_ahb_formal_properties'],
  ['lab-ahb-arbitration-handover', '19_arbiter_behavior'],
  ['lab-ahb-decoder-response-owner', '20_decoder_and_slave_selection'],
  ['lab-ahb-exclusive-monitor', '26_exclusive_accesses'],
  ['lab-ahb-sampled-select', '34_debug_case_studies'],
  ['lab-axi-write-response-prerequisites', '13_write_transaction_walkthrough'],
  ['lab-axi-stalled-read-payload', '14_read_transaction_walkthrough'],
  ['lab-axi-progress-classification', '39_debug_case_studies'],
  ['lab-axi-per-id-ordering', '42_axi_ordering_review_pack'],
  ['lab-axi-4kb-request-check', '25_4kb_boundary_rule'],
  ['lab-axi-response-route-owner', '30_axi_interconnects_crossbars'],
  ['lab-axi-local-id-context', '31_multi_master_reasoning'],
  ['lab-axi-id-narrowing-collision', '38_common_rtl_bugs'],
]);

function getLabs(): DiagnosticLabExercise[] {
  return getExercises().filter((exercise): exercise is DiagnosticLabExercise => exercise.type === 'diagnostic-lab');
}

function getCorrectOption(labId: string, stepId: string) {
  const lab = getLab(labId);
  return lab.diagnosisSteps.find(step => step.id === stepId)?.correctOptionId;
}

function getLab(labId: string): DiagnosticLabExercise {
  const lab = getExerciseById(labId);
  if (!lab || lab.type !== 'diagnostic-lab') throw new Error(`Missing diagnostic lab ${labId}`);
  return lab;
}

describe('Phase V4 diagnostic lab integrity', () => {
  it('keeps every declared lesson exercise resolvable through the production loader', () => {
    for (const { lesson } of getLessons()) {
      for (const exerciseId of lesson.exerciseIds) {
        expect(getExerciseById(exerciseId), `${lesson.id} declares missing exercise ${exerciseId}`).toBeDefined();
      }
    }
  });

  it('keeps every lab structurally complete and linked from its production lesson', () => {
    const labs = getLabs();
    const lessonIds = new Set(getLessons().map(({ lesson }) => lesson.id));

    expect(labs).toHaveLength(expectedLabLessons.size);
    expect(new Set(labs.map(lab => lab.id)).size).toBe(labs.length);

    for (const lab of labs) {
      const expectedLessonId = expectedLabLessons.get(lab.id);
      expect(expectedLessonId, `Unexpected lab ${lab.id}`).toBeDefined();
      expect(lab.relatedLessons).toEqual([expectedLessonId]);
      expect(lessonIds.has(expectedLessonId!)).toBe(true);
      expect(getLessonById(expectedLessonId!)?.lesson.exerciseIds).toContain(lab.id);
      expect(lab.diagnosisSteps.map(step => step.id)).toEqual(['locate', 'own', 'verify']);
      expect(new Set(lab.diagnosisSteps.map(step => step.id)).size).toBe(3);
      expect(lab.evidence.columns.length).toBeGreaterThanOrEqual(2);
      expect(lab.evidence.rows.length).toBeGreaterThanOrEqual(2);

      const columnKeys = lab.evidence.columns.map(column => column.key);
      for (const row of lab.evidence.rows) {
        expect(Object.keys(row.values)).toEqual(columnKeys);
      }
      for (const step of lab.diagnosisSteps) {
        expect(new Set(step.options.map(option => option.id)).size).toBe(step.options.length);
        expect(step.options.some(option => option.id === step.correctOptionId)).toBe(true);
      }
    }
  });

  it('encodes the reviewed AHB ownership, ERROR, and configured-liveness claims', () => {
    expect(getCorrectOption('lab-ahb-pipeline-owner', 'verify')).toBe('accepted-queue');
    expect(getCorrectOption('lab-ahb-stall-stability', 'locate')).toBe('c3');
    expect(getCorrectOption('lab-ahb-error-completion', 'verify')).toBe('choice');
    expect(getCorrectOption('lab-ahb-configured-liveness', 'own')).toBe('configured');
    expect(getCorrectOption('lab-ahb-arbitration-handover', 'locate')).toBe('c3');
    expect(getCorrectOption('lab-ahb-arbitration-handover', 'own')).toBe('split-owner');
    expect(getCorrectOption('lab-ahb-decoder-response-owner', 'verify')).toBe('retimed');
    expect(getCorrectOption('lab-ahb-exclusive-monitor', 'locate')).toBe('e2');
    expect(getCorrectOption('lab-ahb-exclusive-monitor', 'verify')).toBe('exclusive-fail');
    expect(getCorrectOption('lab-ahb-sampled-select', 'locate')).toBe('e2');
    expect(getCorrectOption('lab-ahb-sampled-select', 'verify')).toBe('accepted');

    const handoverLab = getLab('lab-ahb-arbitration-handover');
    const decoderLab = getLab('lab-ahb-decoder-response-owner');
    const exclusiveLab = getLab('lab-ahb-exclusive-monitor');
    const sampledSelectLab = getLab('lab-ahb-sampled-select');
    expect(handoverLab.evidence.rows.find(row => row.id === 'c3')?.values).toMatchObject({
      ready: '1',
      grant: '1',
      result: 'DMA becomes address owner',
    });
    expect(decoderLab.evidence.rows.find(row => row.id === 'c2')?.values).toMatchObject({
      dataOwner: 'A · SRAM',
      mux: 'Default · BUG',
    });
    expect(exclusiveLab.evidence.rows.find(row => row.id === 'e3')?.values.response).toBe('OKAY + HEXOKAY=0');
    expect(exclusiveLab.expectedTakeaway).toMatch(/not a lock failure or an HRESP error/i);
    expect(sampledSelectLab.expectedTakeaway).toMatch(/raw HSEL transition is not an accepted transfer/i);

    const errorExercise = getExerciseById('ex-ahb-review-error');
    const boundedExercise = getExerciseById('ex-ahb-bounded-liveness');
    expect(errorExercise?.expectedTakeaway).toMatch(/permits.*cancel.*does not require/i);
    expect(boundedExercise?.expectedTakeaway).toMatch(/product or integration liveness failure/i);
    expect(boundedExercise?.expectedTakeaway).toMatch(/not by itself a universal AHB safety violation/i);
  });

  it('encodes the reviewed AXI4 response, stability, progress, and per-ID claims', () => {
    expect(getCorrectOption('lab-axi-write-response-prerequisites', 'locate')).toBe('c3');
    expect(getCorrectOption('lab-axi-write-response-prerequisites', 'verify')).toBe('joined');
    expect(getCorrectOption('lab-axi-stalled-read-payload', 'verify')).toBe('full');
    expect(getCorrectOption('lab-axi-progress-classification', 'own')).toBe('integration');
    expect(getCorrectOption('lab-axi-per-id-ordering', 'locate')).toBe('e4');
    expect(getCorrectOption('lab-axi-per-id-ordering', 'verify')).toBe('head');
    expect(getCorrectOption('lab-axi-4kb-request-check', 'locate')).toBe('aw');
    expect(getCorrectOption('lab-axi-4kb-request-check', 'verify')).toBe('page');
    expect(getCorrectOption('lab-axi-response-route-owner', 'locate')).toBe('e2');
    expect(getCorrectOption('lab-axi-response-route-owner', 'verify')).toBe('route-map');
    expect(getCorrectOption('lab-axi-local-id-context', 'locate')).toBe('e3');
    expect(getCorrectOption('lab-axi-local-id-context', 'verify')).toBe('scoped');
    expect(getCorrectOption('lab-axi-id-narrowing-collision', 'locate')).toBe('e2');
    expect(getCorrectOption('lab-axi-id-narrowing-collision', 'verify')).toBe('preserve');

    const boundaryLab = getLab('lab-axi-4kb-request-check');
    const routeLab = getLab('lab-axi-response-route-owner');
    const localIdLab = getLab('lab-axi-local-id-context');
    const narrowingLab = getLab('lab-axi-id-narrowing-collision');
    expect(boundaryLab.evidence.rows.find(row => row.id === 'd1')?.values).toMatchObject({
      address: '0x0FF8–0x1007',
      meaning: 'Crosses boundary',
    });
    expect(boundaryLab.expectedTakeaway).toMatch(/address-request invariant/i);
    expect(routeLab.expectedTakeaway).toMatch(/request arbitration and response routing are different decisions/i);
    expect(localIdLab.expectedTakeaway).toMatch(/interface-scoped, not globally unique/i);
    expect(narrowingLab.expectedTakeaway).toMatch(/accepting a second outstanding transaction/i);

    const progressLab = getExerciseById('lab-axi-progress-classification');
    const coverageExercise = getExerciseById('ex-axi-coverage-holes');
    expect(progressLab?.expectedTakeaway).toMatch(/duration alone does not identify an AXI safety violation/i);
    expect(coverageExercise?.expectedTakeaway).toMatch(/exclusive transaction context/i);
  });

  it('renders every production diagnostic lab through the standard exercise dispatcher', () => {
    for (const lab of getLabs()) {
      const view = render(<InteractiveExercise exercise={lab} />);
      expect(screen.getByRole('heading', { name: lab.title })).toBeInTheDocument();
      expect(screen.getByText(lab.learnerQuestion)).toBeInTheDocument();
      expect(screen.getAllByRole('group')).toHaveLength(3);
      view.unmount();
    }
  });

  it('renders every linked lesson with an Applied DV practice section and no missing exercise state', () => {
    for (const lessonId of expectedLabLessons.values()) {
      const lessonContent = getLessonById(lessonId);
      if (!lessonContent) throw new Error(`Missing lesson ${lessonId}`);

      const view = render(
        <MemoryRouter>
          <LessonRenderer lesson={lessonContent.lesson} body={lessonContent.body} />
        </MemoryRouter>,
      );
      expect(screen.getByRole('heading', { name: 'Applied DV practice' })).toBeInTheDocument();
      expect(screen.queryByText(/Exercise missing:/)).not.toBeInTheDocument();
      view.unmount();
    }
  });
});
