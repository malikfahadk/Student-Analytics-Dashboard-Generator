import React, { useMemo, useState } from 'react';
import { useDataStore } from '../store/dataStore';
import { applyRiskEngine } from '../utils/riskScoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Lightbulb, Users, BookOpen, Clock, Activity, CreditCard, Filter } from 'lucide-react';

const TABS = [
  { id: 'Department', label: 'Department', icon: Users },
  { id: 'Semester', label: 'Semester', icon: BookOpen },
  { id: 'Gender', label: 'Gender', icon: Users },
  { id: 'Attendance', label: 'Attendance', icon: Clock },
  { id: 'StudyHours', label: 'Study Hours', icon: BookOpen },
  { id: 'Stress', label: 'Stress Level', icon: Activity },
  { id: 'FeeStatus', label: 'Fee Status', icon: CreditCard }
];

export default function ComparativeAnalysisPage() {
  const { standardizedData } = useDataStore();
  const [activeTab, setActiveTab] = useState('Department');
  const processedData = useMemo(() => applyRiskEngine(standardizedData || []), [standardizedData]);

  const aggregateBy = (keyOrFn: string | ((d: any) => string)) => {
    const groups: Record<string, { count: number, sumCgpa: number, sumAtt: number, sumMarks: number, passCount: number, highRiskCount: number }> = {};
    
    processedData.forEach(d => {
      const groupKey = typeof keyOrFn === 'function' ? keyOrFn(d) : String(d[keyOrFn]);
      if (!groups[groupKey]) {
        groups[groupKey] = { count: 0, sumCgpa: 0, sumAtt: 0, sumMarks: 0, passCount: 0, highRiskCount: 0 };
      }
      
      const g = groups[groupKey];
      g.count += 1;
      g.sumCgpa += d.cgpa;
      g.sumAtt += d.attendance;
      g.sumMarks += d.finalMarks;
      if (d.result === 'Pass') g.passCount += 1;
      if (d.riskCategory === 'High') g.highRiskCount += 1;
    });

    return Object.keys(groups).map(group => {
      const g = groups[group];
      const count = g.count;
      return {
        name: group,
        count,
        avgCGPA: Number((g.sumCgpa / count).toFixed(2)),
        avgAttendance: Number((g.sumAtt / count).toFixed(1)),
        avgMarks: Number((g.sumMarks / count).toFixed(1)),
        passRate: Number(((g.passCount / count) * 100).toFixed(1)),
        highRiskCount: g.highRiskCount,
        highRiskPercentage: Number(((g.highRiskCount / count) * 100).toFixed(1))
      };
    });
  };

  const generateInsight = (data: any[], metricKey: string, metricLabel: string, higherIsBetter: boolean) => {
    if(data.length < 2) return "Not enough comparative data available for insights.";
    const sorted = [...data].sort((a, b) => b[metricKey] - a[metricKey]);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    
    if (top[metricKey] === bottom[metricKey]) return `All groups show identical ${metricLabel} at ${top[metricKey]}.`;

    if (higherIsBetter) return `${top.name} shows the strongest ${metricLabel} (${top[metricKey]}), while ${bottom.name} shows the lowest (${bottom[metricKey]}).`;
    return `${top.name} shows a concerning peak in ${metricLabel} (${top[metricKey]}), requiring more attention compared to ${bottom.name} (${bottom[metricKey]}).`;
  };

  if (standardizedData.length === 0) return <div className="p-8 text-center text-slate-500">Please upload data to view comparisons.</div>;

  let chartData: any[] = [];
  let insights: string[] = [];
  let primaryChartType = 'bar';

  switch (activeTab) {
    case 'Department':
      chartData = aggregateBy('department');
      insights.push(generateInsight(chartData, 'avgCGPA', 'Average CGPA', true));
      insights.push(generateInsight(chartData, 'highRiskPercentage', 'High Risk %', false));
      break;
    case 'Semester':
      chartData = aggregateBy('semester').sort((a, b) => String(a.name).localeCompare(String(b.name)));
      insights.push(generateInsight(chartData, 'avgMarks', 'Average Marks', true));
      insights.push(generateInsight(chartData, 'avgAttendance', 'Attendance %', true));
      primaryChartType = 'line';
      break;
    case 'Gender':
      chartData = aggregateBy('gender');
      insights.push(generateInsight(chartData, 'passRate', 'Pass Rate %', true));
      insights.push(generateInsight(chartData, 'highRiskPercentage', 'Risk Distribution', false));
      break;
    case 'Attendance':
      chartData = aggregateBy(d => {
        if (d.attendance < 75) return '1. Low (<75%)';
        if (d.attendance <= 84) return '2. Medium (75-84%)';
        return '3. Good (>=85%)';
      }).sort((a,b) => a.name.localeCompare(b.name));
      insights.push("Students with Good Attendance generally demonstrate significantly higher pass rates.");
      insights.push(generateInsight(chartData, 'avgCGPA', 'Average CGPA', true));
      break;
    case 'StudyHours':
      chartData = aggregateBy(d => {
        if (d.studyHours < 2) return '1. Low (< 2hr)';
        if (d.studyHours <= 4) return '2. Medium (2-4hr)';
        return '3. High (> 4hr)';
      }).sort((a,b) => a.name.localeCompare(b.name));
      insights.push(generateInsight(chartData, 'passRate', 'Pass Rate', true));
      break;
    case 'Stress':
      chartData = aggregateBy(d => String(d.stressLevel).toUpperCase());
      insights.push(generateInsight(chartData, 'highRiskPercentage', 'High Risk %', false));
      break;
    case 'FeeStatus':
      chartData = aggregateBy(d => String(d.feeStatus).toUpperCase());
      insights.push(generateInsight(chartData, 'highRiskPercentage', 'Academic Risk Level', false));
      break;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-slate-800">Comparative Analysis</h1>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl shadow-sm flex gap-4 items-start">
        <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-indigo-900 mb-2">Automated Insights</h3>
          <ul className="space-y-2 text-indigo-800">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span> {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Academic Performance</h3>
          <ResponsiveContainer width="100%" height="100%">
            {primaryChartType === 'line' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="avgMarks" name="Avg Marks" stroke="#3b82f6" strokeWidth={3} />
                <Line yAxisId="left" type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10b981" strokeWidth={3} />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Legend />
                <Bar yAxisId="left" dataKey="avgMarks" name="Avg Marks" fill="#3b82f6" radius={[4,4,0,0]} />
                <Bar yAxisId="left" dataKey="passRate" name="Pass Rate %" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-96">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Risk Profile</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip cursor={{fill: '#f8fafc'}} />
              <Legend />
              <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#8b5cf6" radius={[4,4,0,0]} />
              <Bar dataKey="highRiskPercentage" name="High Risk %" fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
