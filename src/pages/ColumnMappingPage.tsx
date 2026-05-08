import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataStore } from '../store/dataStore';
import { STANDARD_FIELDS, cleanData } from '../utils/dataCleaning';
import toast from 'react-hot-toast';

export default function ColumnMappingPage() {
  const navigate = useNavigate();
  const { rawData, setColumnMapping, setStandardizedData } = useDataStore();
  const [localMapping, setLocalMapping] = useState<Record<string, string>>({});
  
  const uploadedColumns = rawData.length > 0 ? Object.keys(rawData[0]) : [];

  useEffect(() => {
    const initialMapping: Record<string, string> = {};
    uploadedColumns.forEach(uploadedCol => {
      const uColLower = uploadedCol.toLowerCase().replace(/[^a-z0-9]/g, '');
      const match = STANDARD_FIELDS.find(f => 
        f.key.toLowerCase().includes(uColLower) || 
        f.label.toLowerCase().replace(/[^a-z0-9]/g, '').includes(uColLower)
      );
      if (match) initialMapping[uploadedCol] = match.key;
    });
    setLocalMapping(initialMapping);
  }, [rawData]);

  const handleApplyMapping = () => {
    const mappedStandardKeys = Object.values(localMapping);
    const missingRequired = STANDARD_FIELDS.filter(f => f.required && !mappedStandardKeys.includes(f.key));
    
    if (missingRequired.length > 0) {
      toast.error(`Missing required mappings: ${missingRequired.map(m => m.label).join(', ')}`);
    }

    setColumnMapping(localMapping);
    const { cleanedData, report } = cleanData(rawData, localMapping);
    setStandardizedData(cleanedData);
    
    toast.success(`Data cleaned successfully! Quality Score: ${report.dataQualityScore}%`);
    navigate('/dashboard');
  };

  if (rawData.length === 0) {
    return <div className="p-8 text-center text-red-500">No data available. Please upload a file first.</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Map Columns</h1>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-4 font-semibold text-gray-600 border-b pb-4 mb-4">
          <div>Uploaded Column</div>
          <div>Standard Field</div>
        </div>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {uploadedColumns.map(uploadedCol => (
            <div key={uploadedCol} className="grid grid-cols-2 gap-4 items-center bg-gray-50 p-3 rounded-lg">
              <div className="font-medium text-gray-800 truncate" title={uploadedCol}>
                {uploadedCol}
              </div>
              <select 
                className="p-2 border rounded bg-white w-full shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={localMapping[uploadedCol] || ""}
                onChange={(e) => setLocalMapping({...localMapping, [uploadedCol]: e.target.value})}
              >
                <option value="">-- Ignore Column --</option>
                {STANDARD_FIELDS.map(field => (
                  <option key={field.key} value={field.key}>
                    {field.label} {field.required ? '*' : ''}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleApplyMapping}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm"
          >
            Apply Mapping & Clean Data
          </button>
        </div>
      </div>
    </div>
  );
}
