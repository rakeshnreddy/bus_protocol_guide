import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('AXI Curriculum Verification', () => {
  const contentDir = join(__dirname, '../content');
  const lessonsDir = join(contentDir, 'lessons', 'axi');
  const glossaryPath = join(contentDir, 'glossary', 'axi.json');

  it('verifies all 44 expected AXI lessons exist and map to the curriculum', () => {
    // Expected lessons for all AXI Sections (A-H)
    const expectedLessons = [
      '01_what_is_axi',
      '02_axi_variants',
      '03_axi_terminology',
      '04_five_channel_model',
      '05_write_address_channel',
      '06_write_data_channel',
      '07_write_response_channel',
      '08_read_address_channel',
      '09_read_data_channel',
      '10_sideband_signals',
      '11_ready_valid_in_depth',
      '12_independent_channel_behavior',
      '13_write_transaction_walkthrough',
      '14_read_transaction_walkthrough',
      '15_burst_structure_beat_progression',
      '16_wlast_and_rlast_meaning',
      '17_ids_and_transaction_matching',
      '18_outstanding_transactions',
      '19_ordering_guarantees',
      '20_out_of_order_completion',
      '21_backpressure_behavior',
      '22_throughput_reasoning_bottlenecks',
      '23_burst_types',
      '24_address_alignment',
      '25_4kb_boundary_rule',
      '26_legal_illegal_patterns',
      '27_axi3_vs_axi4_differences',
      '28_axi4_lite_simplifications',
      '29_axi_stream_semantics',
      '30_axi_interconnects_crossbars',
      '31_multi_master_reasoning',
      '32_qos_system_traffic',
      '33_bridges_mixed_protocol',
      '34_axi_simulation_strategy',
      '35_axi_assertions_protocol_checking',
      '36_axi_functional_coverage',
      '37_axi_formal_property_patterns',
      '38_common_rtl_bugs',
      '39_debug_case_studies',
      '40_axi_expert_checklist',
      '41_axi_signal_quick_reference',
      '42_axi_ordering_review_pack',
      '43_axi_waveform_review_pack',
      '44_axi_interview_recap'
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

  it('verifies all core AXI signals have a glossary entry', () => {
    const glossaryRaw = readFileSync(glossaryPath, 'utf-8');
    const glossary = JSON.parse(glossaryRaw);
    
    // Core signals introduced in Sections A and B
    const requiredSignals = [
      'AWADDR', 'AWLEN', 'AWSIZE', 'AWBURST', 'AWLOCK', 'AWCACHE', 'AWPROT', 'AWQOS', 'AWREGION', 'AWID', 'AWVALID', 'AWREADY',
      'WDATA', 'WSTRB', 'WLAST', 'WVALID', 'WREADY', 'WID',
      'BRESP', 'BID', 'BVALID', 'BREADY',
      'ARADDR', 'ARLEN', 'ARSIZE', 'ARBURST', 'ARLOCK', 'ARCACHE', 'ARPROT', 'ARQOS', 'ARREGION', 'ARID', 'ARVALID', 'ARREADY',
      'RDATA', 'RRESP', 'RLAST', 'RID', 'RVALID', 'RREADY',
      'AxCACHE', 'AxPROT', 'AxQOS', 'AxREGION'
    ];

    const definedTermIds = glossary.map((g: any) => g.id);

    for (const signal of requiredSignals) {
      expect(definedTermIds).toContain(signal);
    }
  });
});
