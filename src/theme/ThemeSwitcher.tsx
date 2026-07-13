import type { ReactNode } from 'react';
import { useTheme } from './ThemeProvider';
import type { ThemePreference } from './ThemeProvider';
import './theme.css';

function SystemIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />
    </svg>
  );
}

const options: { value: ThemePreference; label: string; icon: ReactNode }[] = [
  { value: 'system', label: 'Use system theme', icon: <SystemIcon /> },
  { value: 'light', label: 'Use light theme', icon: <SunIcon /> },
  { value: 'dark', label: 'Use dark theme', icon: <MoonIcon /> },
];

export default function ThemeSwitcher() {
  const { preference, setPreference } = useTheme();

  return (
    <div className="theme-switcher" role="group" aria-label="Color theme">
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          className="theme-option"
          aria-label={option.label}
          aria-pressed={preference === option.value}
          title={option.label}
          style={{ minWidth: 44, minHeight: 44 }}
          onClick={() => setPreference(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}
