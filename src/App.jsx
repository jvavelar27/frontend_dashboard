import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar';
import { useApp } from './context/AppContext';
import { Menu, Moon, Sun } from 'lucide-react';
import Skeleton from './components/UI/Skeleton';

// Lazy Load Pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LeadsPage = lazy(() => import('./pages/LeadsPage'));
const DisparoPage = lazy(() => import('./pages/DisparoPage'));
const WhatsAppPage = lazy(() => import('./pages/WhatsAppPage'));
const MemoriaPage = lazy(() => import('./pages/MemoriaPage'));

function PageLoader() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 lg:col-span-2" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}

function Layout() {
  const { toggleTheme, theme, toggleSidebar } = useApp();

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="ambient" />
      </div>

      <Sidebar />

      <main className="flex-1 relative z-10 flex flex-col min-w-0">
        {/* Floating Controls */}
        <div className="sticky top-0 z-20 px-6 py-4 flex justify-end gap-3 pointer-events-none">
          <div className="pointer-events-auto flex gap-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] backdrop-blur-md shadow-[var(--shadow)] hover:scale-105 active:scale-95 transition-all"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] backdrop-blur-md shadow-[var(--shadow)] hover:scale-105 active:scale-95 transition-all"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        <div className="flex-1 p-6 pt-0 overflow-x-hidden">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/disparo" element={<DisparoPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/memoria" element={<MemoriaPage />} />
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
