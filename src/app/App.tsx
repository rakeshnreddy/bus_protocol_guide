import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Foundations from '../pages/Foundations';
import AHB from '../pages/AHB';
import AXI from '../pages/AXI';
import Glossary from '../pages/Glossary';
import Visuals from '../pages/Visuals';
import LessonPage from '../pages/LessonPage';
import DevVisuals from '../pages/DevVisuals';
import SearchBar from '../components/SearchBar';
import AHBSignals from '../pages/reference/AHBSignals';
import AXISignals from '../pages/reference/AXISignals';
import BurstRules from '../pages/reference/BurstRules';
import OrderingRules from '../pages/reference/OrderingRules';
import SpecRules from '../pages/reference/SpecRules';
import { getLessonsByProtocol } from '../lib/loaders';

import '../styles/global.css';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const lessonsByProtocol = getLessonsByProtocol();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
          {children}
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
