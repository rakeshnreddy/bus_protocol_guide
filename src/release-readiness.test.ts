import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const repositoryRoot = process.cwd();

describe('release-candidate readiness', () => {
  it('publishes explicit academy package metadata', () => {
    const packageJson = JSON.parse(
      readFileSync(`${repositoryRoot}/package.json`, 'utf8'),
    ) as {
      name?: string;
      version?: string;
      engines?: { node?: string };
    };

    expect(packageJson.name).toBe('bus-protocol-dv-academy');
    expect(packageJson.version).toBe('1.0.0-rc.1');
    expect(packageJson.engines?.node).toBe('>=22');
  });

  it('serves direct SPA lesson and reference routes through index.html', () => {
    const vercelConfig = JSON.parse(
      readFileSync(`${repositoryRoot}/vercel.json`, 'utf8'),
    ) as {
      $schema?: string;
      rewrites?: Array<{ source?: string; destination?: string }>;
    };

    expect(vercelConfig.$schema).toBe('https://openapi.vercel.sh/vercel.json');
    expect(vercelConfig.rewrites).toEqual([
      { source: '/(.*)', destination: '/index.html' },
    ]);
  });

  it('uses client-side BrowserRouter without the unstable RSC APIs', () => {
    const appSource = readFileSync(
      `${repositoryRoot}/src/app/App.tsx`,
      'utf8',
    );

    expect(appSource).toContain('BrowserRouter');
    expect(appSource).not.toMatch(/unstable_RSC|RSCRouter|createCallServer/);
  });

  it('ships a privacy-safe, route-specific learner pilot kit', () => {
    const facilitator = readFileSync(
      `${repositoryRoot}/docs/LEARNER_PILOT_FACILITATOR_GUIDE.md`,
      'utf8',
    );
    const session = readFileSync(
      `${repositoryRoot}/docs/LEARNER_PILOT_SESSION_TEMPLATE.md`,
      'utf8',
    );
    const report = readFileSync(
      `${repositoryRoot}/docs/LEARNER_PILOT_REPORT_TEMPLATE.md`,
      'utf8',
    );
    const issueTemplate = readFileSync(
      `${repositoryRoot}/.github/ISSUE_TEMPLATE/learner-pilot-finding.yml`,
      'utf8',
    );
    const simulationReport = readFileSync(
      `${repositoryRoot}/docs/LEARNER_PILOT_SIMULATION_REPORT_2026-07-27.md`,
      'utf8',
    );
    const dataFormat = readFileSync(
      `${repositoryRoot}/docs/LEARNER_PILOT_DATA_FORMAT.md`,
      'utf8',
    );
    const sessionSchema = JSON.parse(
      readFileSync(
        `${repositoryRoot}/docs/learner-pilot/session.schema.json`,
        'utf8',
      ),
    ) as {
      title?: string;
      properties?: Record<string, unknown>;
    };
    const aggregator = readFileSync(
      `${repositoryRoot}/scripts/aggregate-learner-pilot-results.mjs`,
      'utf8',
    );
    const packageJson = JSON.parse(
      readFileSync(`${repositoryRoot}/package.json`, 'utf8'),
    ) as { scripts?: Record<string, string> };

    expect(facilitator).toContain('https://busprotocolguide.vercel.app');
    expect(facilitator).toContain('/lesson/03_timing_diagrams');
    expect(facilitator).toContain('/lesson/16_wait_states_hready');
    expect(facilitator).toContain('/lesson/13_write_transaction_walkthrough');
    expect(facilitator).toContain('/lesson/25_4kb_boundary_rule');
    expect(facilitator).toContain('/lesson/37_axi_formal_property_patterns');
    expect(facilitator).toMatch(/0x3F4[\s\S]*0x403/);
    expect(facilitator).toMatch(/0x0FF8[\s\S]*0x1007[\s\S]*0x1008/);
    expect(facilitator).toContain('Do not start APB work');

    expect(session).toContain('Participant ID');
    expect(session).toContain('Tasks 1–6 correct on first attempt');
    expect(session).toContain('375 × 812');
    expect(report).toContain('At least 80% of Tasks 1–6');
    expect(report).toContain('tag the verified commit `v1.0.0`');

    expect(issueTemplate).toContain('name: Learner pilot finding');
    expect(issueTemplate).toContain('id: severity');
    expect(issueTemplate).toContain('id: protocol_evidence');
    expect(issueTemplate).toContain('id: privacy');

    expect(packageJson.scripts?.['pilot:simulate']).toContain(
      'learner-pilot-simulation.test.ts',
    );
    expect(packageJson.scripts?.['pilot:aggregate']).toContain(
      'aggregate-learner-pilot-results.mjs',
    );
    expect(simulationReport).toContain('Synthetic first-attempt rate');
    expect(simulationReport).toContain('83.3%');
    expect(simulationReport).toContain(
      'No — real learner evidence required',
    );
    expect(dataFormat).toContain('Synthetic sessions');
    expect(dataFormat).toContain('can never authorize promotion');
    expect(sessionSchema.title).toContain('learner pilot session');
    expect(sessionSchema.properties).toHaveProperty('testedCommit');
    expect(sessionSchema.properties).toHaveProperty('usabilityChecks');
    expect(aggregator).toContain("canPromoteStable: decision === 'go'");
    expect(aggregator).toContain(
      'release decisions require human-only evidence',
    );
  });
});
