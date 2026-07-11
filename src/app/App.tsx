import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import SearchBar from '../components/SearchBar';
import { RouteErrorBoundary } from '../components/routing/RouteErrorBoundary';
import { RouteLoadingFallback } from '../components/routing/RouteLoadingFallback';

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

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const [lessonsByProtocol, setLessonsByProtocol] = React.useState<Record<string, any[]>>({});

  React.useEffect(() => {
    import('../lib/loaders').then(({ getLessonsByProtocol }) => {
      setLessonsByProtocol(getLessonsByProtocol());
    });
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <button 
          className="mobile-menu-btn" 
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
          aria-expanded={isSidebarOpen}
        >
          ☰
        </button>
        <h1>Bus Protocol DV Academy</h1>
        <div className="nav-search-container">
          <SearchBar />
        </div>
      </nav>
      <div className="layout-body">
        {/* Mobile backdrop */}
        {isSidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} aria-hidden="true" />
        )}
        
        <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-scrollable">
            <ul>
              <li><Link to="/" onClick={closeSidebar}>Home</Link></li>
              
              {/* Dynamic Lesson Links */}
              {Object.entries(lessonsByProtocol).map(([protocol, lessons]) => (
                <li key={protocol} className="sidebar-section">
                  <div className="sidebar-section-title">{protocol.toUpperCase()}</div>
                  <ul className="sidebar-sublist">
                    {lessons.map(lesson => (
                      <li key={lesson.id}>
                        <Link to={`/lesson/${lesson.id}`} onClick={closeSidebar}>{lesson.title}</Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
              
              <li className="sidebar-section">
                <div className="sidebar-section-title">QUICK REFERENCE</div>
                <ul className="sidebar-sublist">
                  <li><Link to="/reference/ahb-signals" onClick={closeSidebar}>AHB Signals</Link></li>
                  <li><Link to="/reference/axi-signals" onClick={closeSidebar}>AXI Signals</Link></li>
                  <li><Link to="/reference/burst-rules" onClick={closeSidebar}>Burst Rules</Link></li>
                  <li><Link to="/reference/ordering-rules" onClick={closeSidebar}>Ordering Rules</Link></li>
                  <li><Link to="/reference/spec-rules" onClick={closeSidebar}>Spec Rules</Link></li>
                </ul>
              </li>

              <li><Link to="/visuals" onClick={closeSidebar}>Visuals Explorer</Link></li>
              <li><Link to="/glossary" onClick={closeSidebar}>Glossary</Link></li>
            </ul>
          </div>
        </aside>
        <main className="main-content">
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
  );
}
