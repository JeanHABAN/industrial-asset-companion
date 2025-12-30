import { Routes, Route, Link, Navigate } from "react-router-dom";
import StationsList from "./pages/stations/StationsList";
import StationDetail from "./pages/stations/StationDetail";
import AlarmsList from "./pages/alarms/AlarmsList";
import AlarmDetailPage from "./pages/alarms/AlarmDetail";
import StationCreate from "./pages/stations/StationCreate";
import { Toaster } from "react-hot-toast";
import StationEdit from "./pages/stations/StationEdit";
import AlarmDetail from "./pages/alarms/AlarmDetail";
import AppShell from "./layouts/AppShell";
import PlantsPage from "./pages/devices/pages/PlantsPage";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur px-4 py-2 flex gap-4">
        <Link to="/" className="font-semibold">AWC Companion</Link>
        <Link to="/stations">Lift Stations</Link>
        {/* <Link to="/alarms">Alarms</Link> */}

        {/* High-contrast nav button */}
        <Link
          to="/stations/new"
          className="inline-flex h-10 items-center justify-center rounded-xl px-4
                     bg-sky-600 text-white hover:bg-sky-500 active:bg-sky-700
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
                     focus-visible:ring-sky-400 ring-offset-slate-950"
        >
          + New Station
        </Link>

    
        <Link to= "/plants"> Plants (soon) </Link>
      </nav>

      <div className="p-4">
        <Routes>
          <Route element={<AppShell />}></Route>
          <Route path="/" element={<Navigate to="/stations" replace />} />
          <Route path="/stations" element={<StationsList />} />
          <Route path="/stations/:id" element={<StationDetail />} />
          <Route path="/alarms" element={<AlarmsList />} />
          <Route path="/alarms/:id" element={<AlarmDetailPage />} />
          <Route path="/stations/new" element={<StationCreate />} />
          <Route path="/stations/:id/edit" element={<StationEdit />} />
          <Route path="/alarms/:id" element={<AlarmDetail />} />
          <Route path="/plants" element={<PlantsPage />} />

        </Routes>
      </div>

      {/* Toasts visible app-wide */}
      <Toaster position="top-center" />
    </div>
  );
}
