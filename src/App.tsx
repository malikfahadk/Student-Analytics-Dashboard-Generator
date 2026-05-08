import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import DataInputPage from './pages/DataInputPage';
import ColumnMappingPage from './pages/ColumnMappingPage';
import DashboardPage from './pages/DashboardPage';
import ComparativeAnalysisPage from './pages/ComparativeAnalysisPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ExportReportPage from './pages/ExportReportPage';
import PresentationPage from './pages/PresentationPage';
import DocumentationPage from './pages/DocumentationPage';

// A simple Landing Page stub
const LandingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-6 text-blue-400">Dynamic Academic Decision Support System</h1>
      <p className="text-xl mb-8 max-w-2xl text-center text-slate-300">Predict academic risk, discover insights, and generate automated interventions without hardcoded datasets.</p>
      <a href="/upload" className="px-8 py-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500 transition">Get Started</a>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route element={<MainLayout />}>
          <Route path="/upload" element={<DataInputPage />} />
          <Route path="/mapping" element={<ColumnMappingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/comparative-analysis" element={<ComparativeAnalysisPage />} />
          <Route path="/recommendations" element={<RecommendationsPage />} />
          <Route path="/export" element={<ExportReportPage />} />
          <Route path="/presentation" element={<PresentationPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
