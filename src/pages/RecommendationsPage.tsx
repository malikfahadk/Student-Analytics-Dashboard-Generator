import React, { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';

import { Download, Target, AlertTriangle, ShieldCheck, HeartPulse, Landmark, Users, TrendingUp } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function RecommendationsPage() {
  const { standardizedData, mlResults } = useDataStore();
  const processedData = useMemo(() => mlResults ? mlResults.records : [], [mlResults]);

  const generateRecommendations = () => {
    const recs: any[] = [];
    if (processedData.length === 0) return recs;
    const total = processedData.length;
    
    const lowAtt = processedData.filter(d => d.attendance < 75).length;
    if (lowAtt / total > 0.20) {
      recs.push({
        id: 'rec-1', icon: AlertTriangle, area: 'Attendance', priority: 'High', target: 'All Students < 75%',
        problem: 'High number of students are below the attendance requirement.',
        evidence: `${((lowAtt/total)*100).toFixed(1)}% of students have attendance below 75%.`,
        action: 'Start attendance warning system and mandate weekly follow-ups with advisors.',
        outcome: 'Improved attendance and reduced academic risk.'
      });
    }

    const avgCgpa = processedData.reduce((acc, d) => acc + d.cgpa, 0) / total;
    if (avgCgpa < 2.7) {
      recs.push({
        id: 'rec-2', icon: Target, area: 'Academics', priority: 'High', target: 'Students with CGPA < 2.7',
        problem: 'Overall average CGPA is critically low.',
        evidence: `The institutional average CGPA is ${avgCgpa.toFixed(2)}.`,
        action: 'Deploy intensive academic mentoring programs and peer-tutoring networks.',
        outcome: 'Raised institutional average CGPA and increased pass rates.'
      });
    }

    const highStress = processedData.filter(d => String(d.stressLevel).toLowerCase() === 'high').length;
    if (highStress / total > 0.25) {
      recs.push({
        id: 'rec-3', icon: HeartPulse, area: 'Wellness', priority: 'Medium', target: 'High Stress Students',
        problem: 'Significant portion of the student body is experiencing high stress.',
        evidence: `${((highStress/total)*100).toFixed(1)}% of students report high stress levels.`,
        action: 'Organize wellness workshops and increase availability of campus counselors.',
        outcome: 'Better mental health, indirectly leading to improved focus and marks.'
      });
    }

    const pending = processedData.filter(d => String(d.feeStatus).toLowerCase() === 'pending');
    if (pending.length > 0) {
      const pendingRisk = pending.reduce((acc, d) => acc + d.riskScore, 0) / pending.length;
      const overallRisk = processedData.reduce((acc, d) => acc + d.riskScore, 0) / total;
      if (pendingRisk > overallRisk) {
        recs.push({
          id: 'rec-4', icon: Landmark, area: 'Financial', priority: 'Medium', target: 'Pending Fee Students',
          problem: 'Financial stress correlates with higher academic risk.',
          evidence: `Pending fee students have an average risk score of ${pendingRisk.toFixed(1)} vs institutional average ${overallRisk.toFixed(1)}.`,
          action: 'Offer flexible installment plans or connect students with financial aid grants.',
          outcome: 'Reduced financial dropout rate and stabilized academic performance.'
        });
      }
    }

    const depts: Record<string, any[]> = {};
    processedData.forEach(d => { if(!depts[d.department]) depts[d.department] = []; depts[d.department].push(d); });
    Object.keys(depts).forEach(dept => {
      const deptHighRisk = depts[dept].filter(d => d.riskCategory === 'High').length;
      if (deptHighRisk / depts[dept].length > 0.30) {
        recs.push({
          id: `rec-5-${dept}`, icon: Users, area: 'Department Level', priority: 'High', target: `${dept} Department`,
          problem: `The ${dept} department has an alarming rate of high-risk students.`,
          evidence: `${((deptHighRisk/depts[dept].length)*100).toFixed(1)}% of ${dept} students are High Risk.`,
          action: `Conduct immediate faculty review in ${dept} to adjust curriculum pacing.`,
          outcome: 'Normalized risk distribution across all departments.'
        });
      }
    });

    if (recs.length === 0) {
      recs.push({
        id: 'rec-0', icon: ShieldCheck, area: 'Maintenance', priority: 'Low', target: 'Institution Wide',
        problem: 'No critical systemic issues detected.',
        evidence: 'All metrics are currently performing within expected institutional bounds.',
        action: 'Maintain current policies and continue routine monitoring.',
        outcome: 'Sustained excellence.'
      });
    }

    return recs.sort((a, b) => a.priority === 'High' ? -1 : 1);
  };

  const recommendations = generateRecommendations();

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Strategic Decision Recommendations", 14, 22);
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      doc.text(`Total Analyzed Records: ${processedData.length}`, 14, 36);

      const tableData = recommendations.map(r => [r.priority, r.area, r.problem, r.action, r.target]);
      autoTable(doc, {
        startY: 45,
        head: [['Priority', 'Area', 'Problem Identified', 'Recommended Action', 'Target Group']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 9 }
      });

      doc.save('Academic_Action_Plan.pdf');
      toast.success("Recommendations exported to PDF successfully.");
    } catch(err) {
      toast.error("Failed to generate PDF export.");
    }
  };

  if (processedData.length === 0) return <div className="p-8 text-center text-slate-500">Please upload data to generate recommendations.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Management Action Plan</h1>
        </div>
        <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition shadow-sm">
          <Download size={18} /> Export PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {recommendations.map(rec => (
          <div key={rec.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className={`px-6 py-4 border-b flex justify-between items-center ${rec.priority === 'High' ? 'bg-red-50 border-red-100' : rec.priority === 'Medium' ? 'bg-amber-50 border-amber-100' : 'bg-green-50 border-green-100'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${rec.priority === 'High' ? 'bg-red-100 text-red-600' : rec.priority === 'Medium' ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                  <rec.icon size={20} />
                </div>
                <h3 className="font-bold text-slate-800">{rec.area} Intervention</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${rec.priority === 'High' ? 'bg-red-100 text-red-700' : rec.priority === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{rec.priority} Priority</span>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Problem Detected</p>
                <p className="text-slate-800 font-medium">{rec.problem}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Evidence</p>
                <p className="text-slate-700 italic">"{rec.evidence}"</p>
              </div>
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Recommended Action</p>
                  <p className="text-slate-800">{rec.action}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected Outcome</p>
                  <p className="text-green-700 font-medium flex items-center gap-1"><TrendingUp size={16}/> {rec.outcome}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
