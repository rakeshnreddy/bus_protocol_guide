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
});
