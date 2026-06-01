import React, { useMemo } from 'react';
import { useDataStore } from '../store/dataStore';

import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

export default function ExportReportPage() {
  const { standardizedData, mlResults } = useDataStore();
  const processedData = useMemo(() => mlResults ? mlResults.records : [], [mlResults]);

  const downloadCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return toast.error("No data to export");
    const header = Object.keys(data[0]);
    const csv = [
      header.join(','),
      ...data.map(row => header.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(','))
    ].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleExportPDF = () => {
    if (processedData.length === 0) return toast.error("No data available to export.");
    const doc = new jsPDF();
    const total = processedData.length;
    const avgCgpa = (processedData.reduce((acc, d) => acc + d.cgpa, 0) / total).toFixed(2);
    const avgAtt = (processedData.reduce((acc, d) => acc + d.attendance, 0) / total).toFixed(1);
    const passRate = ((processedData.filter(d => d.result === 'Pass').length / total) * 100).toFixed(1);
    
    doc.setFontSize(22);
    doc.text("Dynamic Academic Decision Support System", 14, 22);
    doc.setFontSize(16);
    doc.text("Comprehensive Executive Report", 14, 32);
    doc.setFontSize(12);
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 14, 45);
    doc.text(`Total Students Analyzed: ${total}`, 14, 52);
    doc.text(`Institutional Average CGPA: ${avgCgpa}`, 14, 59);
    doc.text(`Institutional Average Attendance: ${avgAtt}%`, 14, 66);
    doc.text(`Overall Pass Rate: ${passRate}%`, 14, 73);

    doc.setFontSize(14);
    doc.text("High Risk Students Requiring Intervention", 14, 90);
    const highRisk = processedData.filter(d => d.riskCategory === 'High');
    
    autoTable(doc, {
      startY: 95,
      head: [['ID', 'Name', 'Dept', 'Score', 'Reason']],
      body: highRisk.map(h => [h.studentId, h.studentName, h.department, h.riskScore, h.mainReason]),
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
    });

    doc.save('Comprehensive_Academic_Report.pdf');
    toast.success("PDF Report Downloaded!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Export Center</h1>
      <p className="text-slate-500">Generate professional reports and export system data for external use.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-red-100 text-red-600 flex items-center justify-center rounded-lg mb-4">
            <FileText size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Comprehensive PDF Report</h3>
          <button onClick={handleExportPDF} className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
            <Download size={18} /> Download Full PDF
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-lg mb-4">
            <FileSpreadsheet size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">CSV Data Exports</h3>
          <div className="space-y-3 mt-4">
            <button onClick={() => downloadCSV(standardizedData, 'Cleaned_Dataset.csv')} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
               Cleaned Base Dataset
            </button>
            <button onClick={() => downloadCSV(processedData, 'Risk_Analyzed_Dataset.csv')} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
               Full Risk Engine Output
            </button>
            <button onClick={() => downloadCSV(processedData.filter(d=>d.riskCategory==='High'), 'High_Risk_Students.csv')} className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition">
               High Risk List Only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
