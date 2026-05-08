import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { UploadCloud, FileSpreadsheet, Trash2, ArrowRight, Download } from 'lucide-react';
import { useDataStore } from '../store/dataStore';
import toast from 'react-hot-toast';

export default function DataInputPage() {
  const navigate = useNavigate();
  const { rawData, setRawData, clearData } = useDataStore();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        
        if (jsonData.length > 0) {
          setRawData(jsonData);
          toast.success(`Successfully uploaded ${jsonData.length} records!`);
          navigate('/mapping');
        } else {
          toast.error("The uploaded file is empty.");
        }
      } catch (err) {
        toast.error("Error parsing the file. Please ensure it's a valid CSV/Excel.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDownloadTemplate = () => {
    const templateData = [
      "Student Name,Student ID,Department,Semester,Gender,Age,Attendance %,CGPA,Study Hours,Assignment Score,Quiz Score,Midterm Marks,Final Marks,Stress Level,Internet Access,Part-time Job,Support Required,Fee Status",
      "John Doe,CS101,Computer Science,3,Male,20,88,3.4,4,85,80,75,82,Low,Yes,No,No,Paid",
      "Jane Smith,ME102,Mechanical,4,Female,21,72,2.4,1,60,55,45,48,High,Yes,Yes,Yes,Pending",
      "Alex Johnson,EE103,Electrical,3,Other,20,95,3.8,5,92,90,88,91,Low,Yes,No,No,Paid",
      "Sarah Williams,CS104,Computer Science,3,Female,19,81,2.9,3,75,70,68,71,Medium,Yes,No,No,Paid",
      "Michael Brown,CV105,Civil,5,Male,22,65,2.1,1,50,45,40,42,High,No,Yes,Yes,Pending"
    ].join('\r\n');

    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Academic_Data_Template.csv';
    a.click();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Data Input</h1>
      
      {rawData.length > 0 ? (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Dataset Loaded</h2>
              <p className="text-gray-500">{rawData.length} rows currently in memory.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  if(window.confirm("Are you sure you want to clear the dataset?")) clearData();
                }}
                className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
              >
                <Trash2 size={18} /> Clear Data
              </button>
              <button 
                onClick={() => navigate('/mapping')}
                className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
              >
                Clean & Map Data <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-16 text-center transition ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
        >
          <UploadCloud className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">Drag & drop your CSV or Excel file</h3>
          <p className="text-gray-500 mb-6">Support for .csv, .xls, .xlsx</p>
          <div className="flex justify-center gap-4">
            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm">
              <FileSpreadsheet size={20} />
              Browse Files
              <input 
                type="file" 
                className="hidden" 
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              />
            </label>
            <button onClick={handleDownloadTemplate} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition shadow-sm">
              <Download size={20} />
              Download Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
