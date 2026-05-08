import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Upload, Database, BarChart2, Target, Download, MonitorPlay, Book } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  const { standardizedData } = useDataStore();

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
            <LayoutDashboard size={20} />
          </div>
          <h1 className="font-bold text-lg text-slate-800 leading-tight">Academic<br/>Decision System</h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/upload" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Upload size={18} /> Data Input
          </NavLink>
          <NavLink to="/mapping" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Database size={18} /> Column Mapping
          </NavLink>
          <NavLink to="/comparative-analysis" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BarChart2 size={18} /> Comparative Analysis
          </NavLink>
          <NavLink to="/recommendations" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Target size={18} /> Recommendations
          </NavLink>
          <div className="my-4 border-t border-slate-100"></div>
          <NavLink to="/export" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Download size={18} /> Export Reports
          </NavLink>
          <NavLink to="/presentation" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <MonitorPlay size={18} /> Presentation Mode
          </NavLink>
          <NavLink to="/documentation" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Book size={18} /> Documentation
          </NavLink>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <h2 className="text-xl font-semibold text-slate-800">Dynamic Academic Dashboard</h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
              {standardizedData.length} Records Active
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
