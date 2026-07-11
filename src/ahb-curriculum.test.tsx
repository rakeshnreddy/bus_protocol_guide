import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('AHB Curriculum Verification', () => {
  const contentDir = join(__dirname, '../content');
  const lessonsDir = join(contentDir, 'lessons', 'ahb');
  const glossaryPath = join(contentDir, 'glossary', 'ahb.json');

  it('verifies all 38 AHB lessons exist and map to the curriculum', () => {
    // The expected list of 38 lessons from the curriculum map
    const expectedLessons = [
      '01_ahb_overview',
      '02_ahb_variants',
      '03_ahb_terminology',
      '04_clock_and_reset',
      '05_address_and_control',
      '06_htrans_transfer_types',
      '07_burst_and_size',
      '08_data_and_response',
      '09_lock_exclusive_security',
      '10_single_transfers',
      '11_htrans_semantics',
      '12_burst_progression',
      '13_wrapping_bursts',
      '14_hsize_and_alignment',
      '15_address_data_phase',
      '16_wait_states_hready',
      '17_multi_cycle_examples',
      '18_throughput_vs_latency',
      '19_arbiter_behavior',
      '20_decoder_and_slave_selection',
      '21_multi_master_systems',
      '22_ahb_lite_simplifications',
      '23_ahb_to_apb_bridge',
      '24_error_responses',
      '25_locked_sequences',
      '26_exclusive_accesses',
      '27_secure_vs_non_secure',
      '28_ahb5_vs_ahb2',
      '29_ahb_simulation_strategy',
      '30_ahb_assertions',
      '31_ahb_functional_coverage',
      '32_ahb_formal_properties',
      '33_common_rtl_bugs',
      '34_debug_case_studies',
      '35_ahb_expert_checklist',
      '36_ahb_signal_reference',
      '37_ahb_waveform_review',
      '38_ahb_interview_recap'
    ];

    for (const lessonId of expectedLessons) {
      const filePath = join(lessonsDir, `${lessonId}.md`);
      const fileExists = existsSync(filePath);
      expect(fileExists, `Lesson file missing: ${lessonId}.md`).toBe(true);

      // Verify the file can be read and contains the expected frontmatter ID
      const content = readFileSync(filePath, 'utf-8');
      expect(content).toContain(`id: "${lessonId}"`);
    }
  });

  it('verifies all core AHB signals have a glossary entry', () => {
    const glossaryRaw = readFileSync(glossaryPath, 'utf-8');
    const glossary = JSON.parse(glossaryRaw);
    
    // Core signals from Section B
    const requiredSignals = [
      'HCLK', 'HRESETn', 'HADDR', 'HWRITE', 'HPROT', 'HTRANS', 
      'HBURST', 'HSIZE', 'HWDATA', 'HRDATA', 'HREADY', 'HREADYOUT', 
      'HRESP', 'HMASTLOCK', 'HEXCL', 'HEXOKAY', 'HNONSEC'
    ];

    const definedTermIds = glossary.map((g: any) => g.id);

    for (const signal of requiredSignals) {
      expect(definedTermIds).toContain(signal);
    }
  });
});
