import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { applyRiskEngine } from '../utils/riskScoring';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';
import { AlertCircle, Users, GraduationCap, CheckCircle2, TrendingUp, AlertOctagon } from 'lucide-react';

const RISK_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#14b8a6'];

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent == null || isNaN(cx) || isNaN(cy) || percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
  
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderPassRateLabel = (props: any) => {
  const { x, y, value, payload } = props;
  if (value == null || isNaN(x) || isNaN(y)) return null;
  
  const pass = payload?.PassRate ?? value;
  const att = payload?.Attendance ?? 0;
  const isHigher = pass >= att;
  const yOffset = isHigher ? -26 : 10;
  
  return (
    <g>
      <rect x={x - 20} y={y + yOffset} width={40} height={18} fill="white" rx={9} stroke="#10b981" strokeWidth={1} />
      <text x={x} y={y + yOffset + 9} fill="#10b981" fontSize={10} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
        {value}%
      </text>
    </g>
  );
};

const renderAttendanceLabel = (props: any) => {
  const { x, y, value, payload } = props;
  if (value == null || isNaN(x) || isNaN(y)) return null;
  
  const att = payload?.Attendance ?? value;
  const pass = payload?.PassRate ?? 0;
  const isHigher = att > pass;
  const yOffset = isHigher ? -26 : 10;
  
  return (
    <g>
      <rect x={x - 20} y={y + yOffset} width={40} height={18} fill="white" rx={9} stroke="#8b5cf6" strokeWidth={1} />
      <text x={x} y={y + yOffset + 9} fill="#8b5cf6" fontSize={10} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
        {value}%
      </text>
    </g>
  );
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { standardizedData } = useDataStore();
  
  const [filters, setFilters] = useState({
    department: 'All', riskCategory: 'All'
  });

  const processedData = useMemo(() => {
    if (!standardizedData || standardizedData.length === 0) return [];
    let data = applyRiskEngine(standardizedData);
    if (filters.department !== 'All') data = data.filter(d => String(d.department).toUpperCase() === filters.department);
    if (filters.riskCategory !== 'All') data = data.filter(d => d.riskCategory === filters.riskCategory);
    return data;
  }, [standardizedData, filters]);

  if (standardizedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <AlertCircle size={48} className="text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Data Available</h2>
        <button onClick={() => navigate('/upload')} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Upload Data Now</button>
      </div>
    );
  }

  const totalStudents = processedData.length;
  const avgCGPA = (processedData.reduce((acc, d) => acc + d.cgpa, 0) / totalStudents) || 0;
  const avgAttendance = (processedData.reduce((acc, d) => acc + d.attendance, 0) / totalStudents) || 0;
  const avgMarks = (processedData.reduce((acc, d) => acc + d.finalMarks, 0) / totalStudents) || 0;
  const passCount = processedData.filter(d => d.result === 'Pass').length;
  const passRate = (passCount / totalStudents) * 100 || 0;
  const highRiskCount = processedData.filter(d => d.riskCategory === 'High').length;

  const deptStats: Record<string, { count: number, totalMarks: number }> = {};
  const semStats: Record<string, { count: number, passCount: number, totalAttendance: number }> = {};

  processedData.forEach(d => {
    // Dept Aggregation
    const dept = String(d.department).toUpperCase();
    if (!deptStats[dept]) deptStats[dept] = { count: 0, totalMarks: 0 };
    deptStats[dept].count += 1;
    deptStats[dept].totalMarks += d.finalMarks;

    // Semester Aggregation
    const sem = String(d.semester);
    if (!semStats[sem]) semStats[sem] = { count: 0, passCount: 0, totalAttendance: 0 };
    semStats[sem].count += 1;
    semStats[sem].totalAttendance += d.attendance;
    if (d.result === 'Pass') semStats[sem].passCount += 1;
  });

  const deptDistributionData = Object.entries(deptStats).map(([name, stat]) => ({ name, value: stat.count }));
  
  const marksByDeptData = Object.entries(deptStats).map(([name, stat]) => ({ 
    name, AvgMarks: Number((stat.totalMarks / stat.count).toFixed(1)) 
  }));

  const semesterDistributionData = Object.entries(semStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sem, stat]) => ({ name: `Sem ${sem}`, value: stat.count }));

  const percentageBySemesterData = Object.entries(semStats)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([sem, stat]) => ({
      name: `Sem ${sem}`,
      PassRate: Number(((stat.passCount / stat.count) * 100).toFixed(1)),
      Attendance: Number((stat.totalAttendance / stat.count).toFixed(1))
    }));

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4">
        <select className="px-3 py-2 border rounded-lg bg-slate-50 text-sm" onChange={e => setFilters({...filters, department: e.target.value})}>
          <option value="All">All Departments</option>
          {Array.from(new Set(standardizedData.map(d => String(d.department).toUpperCase()))).map(dept => <option key={dept} value={dept}>{dept}</option>)}
        </select>
        <select className="px-3 py-2 border rounded-lg bg-slate-50 text-sm" onChange={e => setFilters({...filters, riskCategory: e.target.value})}>
          <option value="All">All Risks</option>
          <option value="High">High Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="Low">Low Risk</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600" },
          { title: "Avg CGPA", value: avgCGPA.toFixed(2), icon: GraduationCap, color: "text-indigo-600" },
          { title: "Avg Attendance", value: `${avgAttendance.toFixed(1)}%`, icon: CheckCircle2, color: "text-green-600" },
          { title: "Avg Marks", value: avgMarks.toFixed(1), icon: TrendingUp, color: "text-teal-600" },
          { title: "Pass Rate", value: `${passRate.toFixed(1)}%`, icon: CheckCircle2, color: "text-emerald-600" },
          { title: "High Risk", value: highRiskCount, icon: AlertOctagon, color: "text-red-600" },
        ].map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-2">
              <p className="text-slate-500 text-sm font-medium">{kpi.title}</p>
              <kpi.icon size={18} className={kpi.color} />
            </div>
            <h3 className="text-2xl font-bold text-slate-800">{kpi.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Risk Category Distribution</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <Pie data={[
                  { name: 'High Risk', value: processedData.filter(d => d.riskCategory === 'High').length },
                  { name: 'Medium Risk', value: processedData.filter(d => d.riskCategory === 'Medium').length },
                  { name: 'Low Risk', value: processedData.filter(d => d.riskCategory === 'Low').length }
                ]} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  <Cell fill={RISK_COLORS.High} />
                  <Cell fill={RISK_COLORS.Medium} />
                  <Cell fill={RISK_COLORS.Low} />
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Students by Department</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <Pie data={deptDistributionData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  {deptDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Students by Semester</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
                <Pie data={semesterDistributionData} innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value" labelLine={false} label={renderCustomizedLabel}>
                  {semesterDistributionData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Average Marks by Department</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksByDeptData} margin={{ top: 20, right: 30, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b' }} interval={0} angle={-45} textAnchor="end" height={80} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="AvgMarks" name="Avg Final Marks" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  <LabelList dataKey="AvgMarks" position="top" style={{ fontSize: '11px', fill: '#64748b', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-[450px] xl:col-span-2 flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Trends by Semester</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={percentageBySemesterData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} dx={-10} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="PassRate" name="Pass Rate %" stroke="#10b981" strokeWidth={4} activeDot={{ r: 8 }}>
                  <LabelList dataKey="PassRate" content={renderPassRateLabel} />
                </Line>
                <Line type="monotone" dataKey="Attendance" name="Avg Attendance %" stroke="#8b5cf6" strokeWidth={4} activeDot={{ r: 8 }}>
                  <LabelList dataKey="Attendance" content={renderAttendanceLabel} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
