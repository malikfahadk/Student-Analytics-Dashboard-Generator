import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, MonitorPlay } from 'lucide-react';

const SLIDES = [
  { title: "Dynamic Academic Decision Support System", content: "A dynamic, data-driven platform designed to predict academic risk and generate actionable insights without hardcoded datasets." },
  { title: "Problem Statement", content: "Educational institutions collect vast amounts of data but lack the dynamic tools to translate that data into immediate, actionable interventions for struggling students." },
  { title: "System Workflow", content: "1. Raw Data Input \n2. Dynamic Column Mapping & Cleaning\n3. Rule-Based Risk Prediction\n4. Dashboard Visualization\n5. Automated Recommendations Generation." },
  { title: "Data Input & Flexibility", content: "Unlike static Kaggle-based dashboards, this system features a dynamic parser that accepts any CSV/Excel file and maps diverse column names to our required schema." },
  { title: "Risk Engine Methodology", content: "The system calculates Risk Scores (0-100) using multi-variable rules: Attendance <75%, CGPA <2.5, or High Stress + Low Study Hours." },
  { title: "Dashboard & Analytics", content: "Powered by Recharts and Zustand, the dashboard filters and aggregates data in real-time, providing KPI tracking and department-level visibility." },
  { title: "Automated Recommendations", content: "The system scans for systemic issues (e.g., >20% low attendance) and outputs Management Action Plans complete with Priority levels and Expected Outcomes." },
  { title: "Conclusion", content: "By automating data cleaning and risk prediction, this project provides a scalable, premium solution for academic intervention." }
];

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const next = () => setCurrentSlide(prev => Math.min(prev + 1, SLIDES.length - 1));
  const prev = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] bg-slate-900 rounded-xl overflow-hidden relative border-4 border-slate-800 shadow-2xl">
      <div className="text-center p-16 max-w-4xl w-full">
        <MonitorPlay size={48} className="mx-auto text-blue-500 mb-8 opacity-50" />
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">{SLIDES[currentSlide].title}</h2>
        <p className="text-xl md:text-2xl text-slate-300 leading-relaxed whitespace-pre-line">{SLIDES[currentSlide].content}</p>
      </div>
      <div className="absolute bottom-0 w-full bg-slate-800/80 backdrop-blur-sm p-4 flex items-center justify-between border-t border-slate-700">
        <button onClick={prev} disabled={currentSlide === 0} className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-30 transition">
          <ChevronLeft /> Previous
        </button>
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-8 bg-blue-500' : 'w-2 bg-slate-600'}`} />
          ))}
        </div>
        <button onClick={next} disabled={currentSlide === SLIDES.length - 1} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-30 transition">
          Next <ChevronRight />
        </button>
      </div>
    </div>
  );
}
