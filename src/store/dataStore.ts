import { create } from 'zustand';

export interface StandardizedRecord {
  id: string;
  studentName: string;
  studentId: string;
  department: string;
  semester: string;
  gender: string;
  age: number;
  attendance: number;
  cgpa: number;
  studyHours: number;
  assignmentScore: number;
  quizScore: number;
  midtermMarks: number;
  finalMarks: number;
  stressLevel: string;
  internetAccess: string;
  partTimeJob: string;
  supportRequired: string;
  feeStatus: string;
  result?: string;
  [key: string]: any;
}

import { MLAnalyzedRecord, MLModelResults } from '../utils/mlEngine';

interface DataState {
  rawData: any[];
  standardizedData: StandardizedRecord[];
  mlResults: MLModelResults | null;
  columnMapping: Record<string, string>;
  setRawData: (data: any[]) => void;
  setColumnMapping: (mapping: Record<string, string>) => void;
  setStandardizedData: (data: StandardizedRecord[]) => void;
  setMLResults: (results: MLModelResults) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  rawData: [],
  standardizedData: [],
  mlResults: null,
  columnMapping: JSON.parse(localStorage.getItem('columnMapping') || '{}'),
  
  setRawData: (data) => set({ rawData: data }),
  
  setColumnMapping: (mapping) => {
    localStorage.setItem('columnMapping', JSON.stringify(mapping));
    set({ columnMapping: mapping });
  },
  
  setStandardizedData: (data) => set({ standardizedData: data }),

  setMLResults: (results) => set({ mlResults: results }),
  
  clearData: () => {
    localStorage.removeItem('columnMapping');
    set({ rawData: [], standardizedData: [], mlResults: null, columnMapping: {} });
  }
}));
