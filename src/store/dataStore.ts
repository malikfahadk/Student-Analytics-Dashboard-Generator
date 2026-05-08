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

interface DataState {
  rawData: any[];
  standardizedData: StandardizedRecord[];
  columnMapping: Record<string, string>;
  setRawData: (data: any[]) => void;
  setColumnMapping: (mapping: Record<string, string>) => void;
  setStandardizedData: (data: StandardizedRecord[]) => void;
  clearData: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  // Big data is stored purely in-memory to ensure lightning-fast performance and prevent localStorage size limits/freezes.
  rawData: [],
  standardizedData: [],
  columnMapping: JSON.parse(localStorage.getItem('columnMapping') || '{}'),
  
  setRawData: (data) => {
    set({ rawData: data });
  },
  
  setColumnMapping: (mapping) => {
    localStorage.setItem('columnMapping', JSON.stringify(mapping));
    set({ columnMapping: mapping });
  },
  
  setStandardizedData: (data) => {
    set({ standardizedData: data });
  },
  
  clearData: () => {
    localStorage.removeItem('columnMapping');
    set({ rawData: [], standardizedData: [], columnMapping: {} });
  }
}));
