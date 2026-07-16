import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getExerciseById } from '../../lib/loaders';
import DiagnosticLab from './DiagnosticLab';

const interactiveCss = readFileSync(`${process.cwd()}/src/components/interactive/interactive.css`, 'utf8');

function getAhbErrorLab() {
  const exercise = getExerciseById('lab-ahb-error-completion');
  if (!exercise || exercise.type !== 'diagnostic-lab') throw new Error('Missing AHB ERROR diagnostic lab');
  return exercise;
}

describe('DiagnosticLab', () => {
  it('renders production evidence with a keyboard-focusable mobile scroll region', () => {
    render(<DiagnosticLab exercise={getAhbErrorLab()} />);

    const region = screen.getByRole('region', { name: /scrollable evidence/i });

    expect(region).toHaveAttribute('tabindex', '0');
    expect(region).toHaveClass('scroll-container');
    expect(within(region).getByRole('table', { name: /slave response sequence/i })).toBeInTheDocument();
    expect(interactiveCss).toMatch(/\.diagnostic-evidence-scroll\s*\{[^}]*overflow-x:\s*auto/s);
    expect(interactiveCss).toMatch(/\.diagnostic-evidence-table\s*\{[^}]*min-width:\s*720px/s);
    expect(interactiveCss).toMatch(/@media \(max-width:\s*760px\)[\s\S]*\.diagnostic-options\s*\{\s*grid-template-columns:\s*1fr/);
  });

  it('scrolls dense evidence with Arrow, Home, and End keys', () => {
    render(<DiagnosticLab exercise={getAhbErrorLab()} />);
    const region = screen.getByRole('region', { name: /scrollable evidence/i });

    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 720 },
      scrollLeft: { configurable: true, value: 0, writable: true },
    });

    fireEvent.keyDown(region, { key: 'ArrowRight' });
    expect(region.scrollLeft).toBe(225);
    fireEvent.keyDown(region, { key: 'End' });
    expect(region.scrollLeft).toBe(420);
    fireEvent.keyDown(region, { key: 'ArrowLeft' });
    expect(region.scrollLeft).toBe(195);
    fireEvent.keyDown(region, { key: 'Home' });
    expect(region.scrollLeft).toBe(0);
  });

  it('supports keyboard diagnosis, per-step feedback, scoring, and reset', async () => {
    const user = userEvent.setup();
    render(<DiagnosticLab exercise={getAhbErrorLab()} />);

    const submit = screen.getByRole('button', { name: 'Check diagnosis' });
    expect(submit).toBeDisabled();

    const completion = screen.getByRole('radio', { name: /C3, ERROR with HREADY HIGH/i });
    completion.focus();
    await user.keyboard(' ');
    expect(completion).toBeChecked();

    await user.click(screen.getByRole('radio', { name: /selected slave drives HREADYOUT/i }));
    await user.click(screen.getByRole('radio', { name: /may cancel or may continue/i }));
    expect(submit).toBeEnabled();
    await user.click(submit);

    expect(screen.getByText('Diagnosis confirmed')).toBeInTheDocument();
    expect(screen.getAllByText('Reasoning confirmed.')).toHaveLength(3);
    expect(completion).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByRole('button', { name: 'Check diagnosis' })).toBeDisabled();
    expect(completion).not.toBeChecked();
    expect(completion).toBeEnabled();
  });

  it('reports incomplete reasoning and keeps every choice above the touch minimum', async () => {
    const user = userEvent.setup();
    render(<DiagnosticLab exercise={getAhbErrorLab()} />);

    const incorrect = screen.getByRole('radio', { name: /C1, the normal wait state/i });
    await user.click(incorrect);
    await user.click(screen.getByRole('radio', { name: /master directly drives HREADY/i }));
    await user.click(screen.getByRole('radio', { name: /must cancel every remaining beat/i }));
    await user.click(screen.getByRole('button', { name: 'Check diagnosis' }));

    expect(screen.getByText('0 of 3 decisions confirmed')).toBeInTheDocument();
    expect(screen.getAllByText('Revisit this decision.')).toHaveLength(3);
    expect(incorrect.closest('label')).toHaveClass('diagnostic-option');
    expect(interactiveCss).toMatch(/\.diagnostic-option\s*\{[^}]*min-height:\s*52px/s);
  });
});
