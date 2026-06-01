import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { trainAndApplyMLModels, MLModelResults } from '../utils/mlEngine';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter, ZAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, AreaChart, Area, Treemap } from 'recharts';
import { AlertCircle, Users, GraduationCap, CheckCircle2, TrendingUp, AlertOctagon, Brain, Download, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';

const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { standardizedData, mlResults, setMLResults } = useDataStore();
  
  const [filters, setFilters] = useState({ department: 'All', cluster: 'All', search: '' });
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    if (standardizedData.length > 0 && !mlResults && !isTraining) {
      setIsTraining(true);
      // Simulate async to allow UI to show loader
      setTimeout(() => {
        const results = trainAndApplyMLModels(standardizedData);
        setMLResults(results);
        setIsTraining(false);
      }, 500);
    }
  }, [standardizedData, mlResults, isTraining, setMLResults]);

  const processedData = useMemo(() => {
    if (!mlResults) return [];
    let data = mlResults.records;
    if (filters.department !== 'All') data = data.filter(d => String(d.department).toUpperCase() === filters.department);
    if (filters.cluster !== 'All') data = data.filter(d => String(d.cluster) === filters.cluster);
    if (filters.search) data = data.filter(d => d.studentName?.toLowerCase().includes(filters.search.toLowerCase()) || d.studentId?.toLowerCase().includes(filters.search.toLowerCase()));
    return data;
  }, [mlResults, filters]);

  if (standardizedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertCircle size={48} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Data Available</h2>
        <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Upload Data Now</button>
      </div>
    );
  }

  if (isTraining || !mlResults) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
        <h2 className="text-2xl font-bold text-slate-800">Training ML Models...</h2>
        <p className="text-slate-500">Running K-Means, Neural Networks, and Regression on your data.</p>
      </div>
    );
  }

  const exportAsPNG = async () => {
    const dashboard = document.getElementById('dashboard-content');
    if (!dashboard) return;
    const canvas = await html2canvas(dashboard);
    const link = document.createElement('a');
    link.download = 'dashboard-export.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const totalStudents = processedData.length;
  const avgCGPA = (processedData.reduce((acc, d) => acc + d.cgpa, 0) / totalStudents) || 0;
  const avgAttendance = (processedData.reduce((acc, d) => acc + d.attendance, 0) / totalStudents) || 0;
  const highRiskCount = processedData.filter(d => d.riskCategory === 'High').length;
  const riskPercentage = (highRiskCount / totalStudents) * 100 || 0;
  const outliersCount = processedData.filter(d => d.isOutlier).length;

  // Visualizations Data Preparation
  const scatterData = processedData.map(d => ({ x: d.cgpa, y: d.attendance, z: d.studyHours, name: d.studentName }));
  
  const radarData = [
    { subject: 'Attendance', A: avgAttendance, fullMark: 100 },
    { subject: 'CGPA', A: (avgCGPA / 4) * 100, fullMark: 100 },
    { subject: 'Assignments', A: (processedData.reduce((acc, d) => acc + d.assignmentScore, 0) / totalStudents) || 0, fullMark: 100 },
    { subject: 'Midterms', A: (processedData.reduce((acc, d) => acc + d.midtermMarks, 0) / totalStudents) || 0, fullMark: 100 },
    { subject: 'Finals', A: (processedData.reduce((acc, d) => acc + d.finalMarks, 0) / totalStudents) || 0, fullMark: 100 },
  ];

  const composedData = processedData.slice(0, 50).map(d => ({
    name: d.studentName?.substring(0, 10),
    marks: d.finalMarks,
    risk: d.riskScore
  }));

  const areaData = processedData.slice(0, 50).map(d => ({
    name: d.studentName?.substring(0, 5),
    actual: d.finalMarks,
    predicted: d.predictedMarks
  }));

  const deptGroups = processedData.reduce((acc: any, d) => {
    const dept = d.department || 'Unknown';
    if (!acc[dept]) acc[dept] = 0;
    acc[dept] += 1;
    return acc;
  }, {});
  const treemapData = Object.entries(deptGroups).map(([name, size]) => ({ name, size }));

  return (
    <div className="space-y-6" id="dashboard-content">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100 gap-4 backdrop-blur-md bg-opacity-80">
        <div className="flex flex-wrap gap-4 flex-1">
          <input type="text" placeholder="Search Student..." className="px-3 py-2 border rounded-lg bg-slate-50 text-sm focus:ring-2 focus:ring-blue-400 outline-none" onChange={e => setFilters({...filters, search: e.target.value})} />
          <select className="px-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none" onChange={e => setFilters({...filters, department: e.target.value})}>
            <option value="All">All Departments</option>
            {Array.from(new Set(standardizedData.map(d => String(d.department).toUpperCase()))).map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
          <select className="px-3 py-2 border rounded-lg bg-slate-50 text-sm outline-none" onChange={e => setFilters({...filters, cluster: e.target.value})}>
            <option value="All">All Clusters</option>
            <option value="0">Cluster 0 (At-Risk)</option>
            <option value="1">Cluster 1 (Average)</option>
            <option value="2">Cluster 2 (High Performers)</option>
          </select>
        </div>
        <button onClick={exportAsPNG} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow-sm text-sm">
          <Download size={16} /> Export Dashboard PNG
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { title: "Avg CGPA", value: avgCGPA.toFixed(2), icon: GraduationCap, color: "text-indigo-600", bg: "bg-indigo-50" },
          { title: "Avg Attendance", value: `${avgAttendance.toFixed(1)}%`, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
          { title: "Risk Percentage", value: `${riskPercentage.toFixed(1)}%`, icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50" },
          { title: "Outliers Detected", value: outliersCount, icon: AlertCircle, color: "text-orange-600", bg: "bg-orange-50" },
          { title: "Model Accuracy", value: `${mlResults.accuracy.toFixed(1)}%`, icon: Brain, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-20 transition-transform group-hover:scale-150 ${kpi.bg}`}></div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <p className="text-slate-500 text-sm font-semibold">{kpi.title}</p>
              <div className={`p-1.5 rounded-md ${kpi.bg}`}><kpi.icon size={16} className={kpi.color} /></div>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 relative z-10">{kpi.value}</h3>
          </div>
        ))}
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Scatter / Bubble Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">CGPA vs Attendance (Bubble: Study Hours)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" dataKey="x" name="CGPA" domain={[0, 4]} tick={{fontSize: 10}} />
                <YAxis type="number" dataKey="y" name="Attendance" domain={[0, 100]} tick={{fontSize: 10}} />
                <ZAxis type="number" dataKey="z" range={[50, 400]} name="Study Hours" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{borderRadius: '8px'}} />
                <Scatter name="Students" data={scatterData} fill="#8b5cf6" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Average Performance Profile</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#64748b'}} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar name="Average Student" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Composed Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Marks vs AI Risk Score</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={composedData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <CartesianGrid stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={false} axisLine={false} />
                <YAxis yAxisId="left" tick={{fontSize: 10}} domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10}} domain={[0, 100]} />
                <Tooltip contentStyle={{borderRadius: '8px'}} />
                <Bar yAxisId="left" dataKey="marks" barSize={10} fill="#10b981" radius={[4,4,0,0]} name="Final Marks" />
                <Line yAxisId="right" type="monotone" dataKey="risk" stroke="#ef4444" strokeWidth={3} dot={false} name="Risk Score" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area Chart: Actual vs Predicted */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] xl:col-span-2 flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Actual vs Predicted Performance (Regression)</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, bottom: 10, left: -20 }}>
                <defs>
                  <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip contentStyle={{borderRadius: '8px'}} />
                <Legend iconType="circle" wrapperStyle={{fontSize: '11px'}} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fillOpacity={1} fill="url(#colorActual)" name="Actual Marks" />
                <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPredicted)" name="ML Predicted Marks" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Treemap for Department Size */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[400px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Department Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <Treemap
                data={treemapData}
                dataKey="size"
                aspectRatio={4 / 3}
                stroke="#fff"
                fill="#8b5cf6"
              >
                <Tooltip formatter={(value: any) => [`${value} Students`, 'Size']} />
              </Treemap>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI Insights Panel */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[100px] opacity-20 -z-10 translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -z-10 -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="flex items-center gap-3 mb-6">
          <Brain size={24} className="text-purple-400" />
          <h2 className="text-xl font-bold">AI Analytics Insights</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-semibold">Feature Importance</h4>
            <ul className="space-y-2">
              <li className="flex justify-between items-center text-sm">
                <span>Attendance</span>
                <span className="text-blue-400 font-mono">{(mlResults.featureImportance.Attendance * 100).toFixed(1)}%</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>CGPA</span>
                <span className="text-purple-400 font-mono">{(mlResults.featureImportance.CGPA * 100).toFixed(1)}%</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span>Study Hours</span>
                <span className="text-emerald-400 font-mono">{(mlResults.featureImportance.StudyHours * 100).toFixed(1)}%</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-semibold">Risk Analysis</h4>
            <p className="text-sm leading-relaxed text-slate-300">
              The Neural Network has identified <strong className="text-red-400">{highRiskCount} students</strong> as high risk. The model accuracy against standard heuristics is currently <strong className="text-emerald-400">{mlResults.accuracy.toFixed(1)}%</strong>.
            </p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-semibold">Clustering (K-Means)</h4>
            <p className="text-sm leading-relaxed text-slate-300">
              Students were grouped into 3 distinct clusters based on their behavioral patterns (Attendance vs CGPA). Use the filter above to isolate and study specific clusters.
            </p>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-sm text-slate-400 mb-2 uppercase tracking-wide font-semibold">Anomaly Detection</h4>
            <p className="text-sm leading-relaxed text-slate-300">
              Found <strong className="text-orange-400">{outliersCount} outliers</strong> using Z-Score statistical analysis. These are students whose performance deviates significantly from the mean.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
