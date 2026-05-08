import React from 'react';
import { Book, CheckCircle, AlertCircle, Info, Database } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-800 p-8 text-white">
        <Book size={32} className="mb-4 text-blue-400" />
        <h1 className="text-3xl font-bold mb-2">System Documentation</h1>
        <p className="text-slate-300 text-lg">Dynamic Academic Decision Support System</p>
      </div>

      <div className="p-8 space-y-8 text-slate-700">
        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Info className="text-blue-600"/> About the Project</h2>
          <p className="leading-relaxed">This platform is a data-agnostic academic analytics engine. Unlike static dashboards tied to a single Kaggle dataset, this system accepts varied academic data, normalizes it via the Column Mapping module, and dynamically calculates risk profiles.</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><Database className="text-purple-600"/> Data Upload Guidance</h2>
          <p className="mb-4 text-slate-700">To get the most accurate insights from the system, please ensure your dataset follows these guidelines:</p>
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 mb-1">1. Supported File Types</h3>
              <p className="text-sm text-slate-600">The system accepts both <strong>.CSV</strong> and <strong>.XLSX (Excel)</strong> files. Ensure your data is strictly on the first sheet.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">2. Required Data Structure</h3>
              <p className="text-sm text-slate-600">Your dataset must be in a standard tabular format (rows and columns). The first row must contain the column headers (e.g., "Student Name", "Attendance", "CGPA"). Do not include merged cells or multiple header rows.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">3. Key Data Fields to Include</h3>
              <p className="text-sm text-slate-600">While the system is highly flexible, the Risk Engine requires the following data points to function properly:</p>
              <ul className="list-disc pl-5 mt-2 text-sm text-slate-600 space-y-1">
                <li><strong>Attendance:</strong> Numeric percentage (0 - 100). Essential for early warning detection.</li>
                <li><strong>CGPA:</strong> Numeric grade point average (0.0 - 4.0). Essential for academic standing.</li>
                <li><strong>Final Marks:</strong> Numeric score (0 - 100).</li>
                <li><strong>Department & Semester:</strong> Text/Categorical data. Essential for comparative analysis and grouping.</li>
                <li><strong>Optional but Recommended:</strong> Stress Level (High/Medium/Low), Study Hours (Numeric), Fee Status (Paid/Pending).</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 mb-1">4. Column Name Flexibility</h3>
              <p className="text-sm text-slate-600">You do <strong>not</strong> need to rename your Excel columns before uploading! The system's <em>Column Mapping</em> feature will allow you to visually link your custom column names (e.g., "Student's Current CGPA") directly to the system's standard fields (e.g., "CGPA").</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle className="text-green-600"/> How to Use</h2>
          <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
            <li>Navigate to Data Input and upload your institution's CSV/Excel file.</li>
            <li>Go to Column Mapping to align your dataset's headers.</li>
            <li>Click Apply Mapping & Clean Data to trigger the data normalization engine.</li>
            <li>Explore the Dashboard and Comparative Analysis pages for insights.</li>
            <li>Visit Recommendations to export the automated management action plan.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle className="text-red-600"/> Risk Scoring Explained</h2>
          <p className="mb-4">The risk engine operates on a multi-variable rule set designed to predict academic failure:</p>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>High Risk:</strong> Attendance &lt; 75% OR CGPA &lt; 2.5 OR Final Marks &lt; 50 OR (High Stress AND Study Hours &lt; 2)</li>
              <li><strong>Low Risk:</strong> Attendance &ge; 85% AND CGPA &ge; 3.0 AND Final Marks &ge; 65</li>
              <li><strong>Medium Risk:</strong> All other students falling between the upper and lower thresholds.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
