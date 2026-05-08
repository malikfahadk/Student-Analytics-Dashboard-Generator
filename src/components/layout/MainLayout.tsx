import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Upload, Database, BarChart2, Target, Download, MonitorPlay, Book, Menu, X } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { Toaster } from 'react-hot-toast';

export default function MainLayout() {
  const { standardizedData } = useDataStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity" 
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg shadow-sm">
              <LayoutDashboard size={20} />
            </div>
            <h1 className="font-bold text-lg text-slate-800 leading-tight">Academic<br/>Decision System</h1>
          </div>
          <button onClick={closeMenu} className="md:hidden text-slate-500 hover:bg-slate-100 p-1.5 rounded-md">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <NavLink to="/dashboard" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/upload" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Upload size={18} /> Data Input
          </NavLink>
          <NavLink to="/mapping" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Database size={18} /> Column Mapping
          </NavLink>
          <NavLink to="/comparative-analysis" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BarChart2 size={18} /> Comparative Analysis
          </NavLink>
          <NavLink to="/recommendations" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Target size={18} /> Recommendations
          </NavLink>
          <div className="my-4 border-t border-slate-100"></div>
          <NavLink to="/export" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Download size={18} /> Export Reports
          </NavLink>
          <NavLink to="/presentation" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <MonitorPlay size={18} /> Presentation Mode
          </NavLink>
          <NavLink to="/documentation" onClick={closeMenu} className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Book size={18} /> Documentation
          </NavLink>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden text-slate-600 hover:bg-slate-100 p-2 rounded-md">
              <Menu size={24} />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-slate-800 truncate">Dynamic Academic Dashboard</h2>
          </div>
          <div className="flex items-center">
            <div className="hidden md:block px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
              {standardizedData.length} Records Active
            </div>
            <div className="md:hidden px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
              {standardizedData.length} Recs
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
