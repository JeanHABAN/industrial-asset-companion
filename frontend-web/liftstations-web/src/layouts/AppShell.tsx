// src/layouts/AppShell.tsx
import { Link, NavLink, Outlet } from 'react-router-dom';
import { MapPin, ActivitySquare, Plus, QrCode } from 'lucide-react';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="font-semibold tracking-tight">Industrial Asset Companion</Link>
          <div className="flex items-center gap-2">
            <Link to="/stations/new" className="btn-primary">
              <Plus className="size-4 mr-1" /> New Lift Station
            </Link>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3 lg:col-span-2 space-y-2">
          <NavItem to="/stations" icon={<MapPin className="size-4" />} label="Lift Stations" />
          <NavItem to="/alarms" icon={<ActivitySquare className="size-4" />} label="Alarms" />
        </aside>

        {/* Main */}
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-800 mt-8">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs text-slate-400">
          Read-only by design. Scan labels <QrCode className="inline size-3" /> for field access.
        </div>
      </footer>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg border ${
          isActive
            ? 'bg-slate-900 border-slate-700 text-sky-300'
            : 'bg-slate-950 border-slate-900 hover:bg-slate-900/70'
        }`
      }
    >
      {icon}<span>{label}</span>
    </NavLink>
  );
}
