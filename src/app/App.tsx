import React from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import SearchBar from '../components/SearchBar';
import ThemeSwitcher from '../theme/ThemeSwitcher';
import { ThemeProvider } from '../theme/ThemeProvider';
import { RouteErrorBoundary } from '../components/routing/RouteErrorBoundary';
import { RouteLoadingFallback } from '../components/routing/RouteLoadingFallback';
import type { Lesson } from '../types/content';

import '../styles/global.css';

const Foundations = React.lazy(() => import('../pages/Foundations'));
const AHB = React.lazy(() => import('../pages/AHB'));
const AXI = React.lazy(() => import('../pages/AXI'));
const Glossary = React.lazy(() => import('../pages/Glossary'));
const Visuals = React.lazy(() => import('../pages/Visuals'));
const LessonPage = React.lazy(() => import('../pages/LessonPage'));
const DevVisuals = React.lazy(() => import('../pages/DevVisuals'));
const AHBSignals = React.lazy(() => import('../pages/reference/AHBSignals'));
const AXISignals = React.lazy(() => import('../pages/reference/AXISignals'));
const BurstRules = React.lazy(() => import('../pages/reference/BurstRules'));
const OrderingRules = React.lazy(() => import('../pages/reference/OrderingRules'));
const SpecRules = React.lazy(() => import('../pages/reference/SpecRules'));

const protocolLabels: Record<string, string> = {
  foundations: 'Foundations',
  ahb: 'AMBA AHB',
  axi: 'AMBA AXI',
};

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 42 42" aria-hidden="true">
      <path d="M8 11h18l7 7M8 21h25M8 31h18l7-7" />
      <circle cx="8" cy="11" r="2" />
      <circle cx="8" cy="21" r="2" />
      <circle cx="8" cy="31" r="2" />
      <circle cx="34" cy="18" r="2" />
      <circle cx="34" cy="21" r="2" />
      <circle cx="34" cy="24" r="2" />
    </svg>
  );
}

function NavGlyph({ kind }: { kind: 'home' | 'visuals' | 'glossary' | 'reference' }) {
  const paths = {
    home: <path d="m4 11 8-7 8 7v9h-6v-6h-4v6H4Z" />,
    visuals: <path d="M3 12h3l2-7 4 14 3-10 2 6h4" />,
    glossary: <><path d="M5 4h10a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z" /><path d="M8 4v16M11 8h4M11 12h4" /></>,
    reference: <><path d="M6 3h12v18H6z" /><path d="M9 8h6M9 12h6M9 16h4" /></>,
  };
  return <svg className="nav-glyph" viewBox="0 0 24 24" aria-hidden="true">{paths[kind]}</svg>;
}

function SidebarSection({
  protocol,
  lessons,
  expanded,
  onToggle,
  onNavigate,
}: {
  protocol: string;
  lessons: Lesson[];
  expanded: boolean;
  onToggle: (open: boolean) => void;
  onNavigate: () => void;
}) {
  return (
    <details className={`curriculum-section protocol-${protocol}`} open={expanded} onToggle={event => onToggle(event.currentTarget.open)}>
      <summary>
        <span className="protocol-indicator" aria-hidden="true" />
        <span>{protocolLabels[protocol] ?? protocol}</span>
        <span className="section-count">{lessons.length}</span>
        <svg className="section-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
      </summary>
      <div className="curriculum-links">
        <NavLink to={`/${protocol}`} onClick={onNavigate} className="protocol-overview-link">
          View curriculum map
        </NavLink>
        {lessons.map(lesson => (
          <NavLink
            key={lesson.id}
            to={`/lesson/${lesson.id}`}
            onClick={onNavigate}
            className="lesson-nav-link"
          >
            <span className="lesson-nav-order">{String(lesson.order).padStart(2, '0')}</span>
            <span>{lesson.title}</span>
          </NavLink>
        ))}
      </div>
    </details>
  );
}

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [lessonsByProtocol, setLessonsByProtocol] = React.useState<Record<string, Lesson[]>>({});
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(() => new Set());
  const location = useLocation();

  React.useEffect(() => {
    let active = true;
    import('../lib/loaders').then(({ getLessonsByProtocol }) => {
      if (active) setLessonsByProtocol(getLessonsByProtocol());
    });
    return () => { active = false; };
  }, []);

  React.useEffect(() => {
    const lessonId = location.pathname.startsWith('/lesson/') ? location.pathname.replace('/lesson/', '') : null;
    const activeProtocol = lessonId
      ? Object.entries(lessonsByProtocol).find(([, lessons]) => lessons.some(lesson => lesson.id === lessonId))?.[0]
      : ['foundations', 'ahb', 'axi'].find(protocol => location.pathname === `/${protocol}`);

    if (activeProtocol) {
      setExpandedSections(current => {
        if (current.has(activeProtocol)) return current;
        return new Set([...current, activeProtocol]);
      });
    }
  }, [lessonsByProtocol, location.pathname]);

  const closeSidebar = () => setIsSidebarOpen(false);
  const updateSection = (protocol: string, open: boolean) => {
    setExpandedSections(current => {
      const next = new Set(current);
      if (open) next.add(protocol);
      else next.delete(protocol);
      return next;
    });
  };

  return (
    <div className="app-container">
      <a className="skip-link" href="#main-content">Skip to lesson content</a>
      <header className="top-nav">
        <button
          className="mobile-menu-btn"
          onClick={() => setIsSidebarOpen(open => !open)}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="academy-sidebar"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <MenuIcon open={isSidebarOpen} />
        </button>

        <Link className="brand-link" to="/" aria-label="Bus Protocol DV Academy home">
          <span className="visually-hidden">Bus Protocol DV Academy</span>
          <BrandMark />
          <span className="brand-copy" aria-hidden="true">
            <strong>Bus Protocol</strong>
            <span>DV Academy</span>
          </span>
        </Link>

        <div className="nav-search-container">
          <SearchBar />
        </div>

        <div className="nav-actions">
          <ThemeSwitcher />
        </div>
      </header>

      <div className="layout-body">
        {isSidebarOpen && <button className="sidebar-backdrop" onClick={closeSidebar} aria-label="Close navigation menu" />}

        <aside id="academy-sidebar" className={`sidebar ${isSidebarOpen ? 'open' : ''}`} aria-label="Academy curriculum">
          <nav className="sidebar-scrollable" aria-label="Primary navigation">
            <div className="sidebar-primary-links">
              <NavLink to="/" end onClick={closeSidebar}><NavGlyph kind="home" /><span>Home</span></NavLink>
              <NavLink to="/visuals" onClick={closeSidebar}><NavGlyph kind="visuals" /><span>Visuals Explorer</span></NavLink>
              <NavLink to="/glossary" onClick={closeSidebar}><NavGlyph kind="glossary" /><span>Glossary</span></NavLink>
            </div>

            <div className="sidebar-label">Curriculum</div>
            {Object.keys(lessonsByProtocol).length === 0 ? (
              <div className="sidebar-skeleton" role="status" aria-label="Loading curriculum">
                <span /><span /><span />
              </div>
            ) : (
              Object.entries(lessonsByProtocol).map(([protocol, lessons]) => (
                <SidebarSection
                  key={protocol}
                  protocol={protocol}
                  lessons={lessons}
                  expanded={expandedSections.has(protocol)}
                  onToggle={open => updateSection(protocol, open)}
                  onNavigate={closeSidebar}
                />
              ))
            )}

            <details className="curriculum-section reference-section">
              <summary>
                <NavGlyph kind="reference" />
                <span>Quick reference</span>
                <svg className="section-chevron" viewBox="0 0 20 20" aria-hidden="true"><path d="m6 8 4 4 4-4" /></svg>
              </summary>
              <div className="curriculum-links">
                <NavLink to="/reference/ahb-signals" onClick={closeSidebar}>AHB signals</NavLink>
                <NavLink to="/reference/axi-signals" onClick={closeSidebar}>AXI signals</NavLink>
                <NavLink to="/reference/burst-rules" onClick={closeSidebar}>Burst rules</NavLink>
                <NavLink to="/reference/ordering-rules" onClick={closeSidebar}>Ordering rules</NavLink>
                <NavLink to="/reference/spec-rules" onClick={closeSidebar}>Specification rules</NavLink>
              </div>
            </details>
          </nav>
          <div className="sidebar-footer">
            <span className="status-dot" aria-hidden="true" />
            <span>Local-first academy</span>
          </div>
        </aside>

        <main id="main-content" className="main-content" tabIndex={-1}>
          <RouteErrorBoundary resetKey={location.pathname}>
            <React.Suspense fallback={<RouteLoadingFallback />}>
              {children}
            </React.Suspense>
          </RouteErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/foundations" element={<Foundations />} />
            <Route path="/ahb" element={<AHB />} />
            <Route path="/axi" element={<AXI />} />
            <Route path="/visuals" element={<Visuals />} />
            <Route path="/glossary" element={<Glossary />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/dev/visuals" element={<DevVisuals />} />
            <Route path="/reference/ahb-signals" element={<AHBSignals />} />
            <Route path="/reference/axi-signals" element={<AXISignals />} />
            <Route path="/reference/burst-rules" element={<BurstRules />} />
            <Route path="/reference/ordering-rules" element={<OrderingRules />} />
            <Route path="/reference/spec-rules" element={<SpecRules />} />
            <Route path="/reference/bug-patterns" element={<Navigate to="/reference/spec-rules" replace />} />
          </Routes>
        </AppShell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
