import { StandardizedRecord } from '../store/dataStore';

export const STANDARD_FIELDS = [
  { key: 'studentName', label: 'Student Name', required: true },
  { key: 'studentId', label: 'Student ID', required: true },
  { key: 'department', label: 'Department', required: true },
  { key: 'semester', label: 'Semester', required: true },
  { key: 'gender', label: 'Gender', required: true },
  { key: 'age', label: 'Age', required: true },
  { key: 'attendance', label: 'Attendance %', required: true },
  { key: 'cgpa', label: 'CGPA', required: true },
  { key: 'studyHours', label: 'Study Hours', required: false },
  { key: 'assignmentScore', label: 'Assignment Score', required: false },
  { key: 'quizScore', label: 'Quiz Score', required: false },
  { key: 'midtermMarks', label: 'Midterm Marks', required: false },
  { key: 'finalMarks', label: 'Final Marks', required: true },
  { key: 'stressLevel', label: 'Stress Level', required: false },
  { key: 'internetAccess', label: 'Internet Access', required: false },
  { key: 'partTimeJob', label: 'Part-time Job', required: false },
  { key: 'supportRequired', label: 'Support Required', required: false },
  { key: 'feeStatus', label: 'Fee Status', required: false }
];

export function cleanData(rawData: any[], mapping: Record<string, string>) {
  let duplicates = 0, invalidAttendance = 0, invalidCgpa = 0, invalidMarks = 0, missingValues = 0;
  const seenIds = new Set();
  const cleaned: StandardizedRecord[] = [];

  rawData.forEach(row => {
    const record: any = { id: crypto.randomUUID() };
    
    Object.keys(mapping).forEach(fileCol => {
      const standardCol = mapping[fileCol];
      if (standardCol) record[standardCol] = row[fileCol];
    });

    Object.keys(record).forEach(k => {
      if (typeof record[k] === 'string') record[k] = record[k].trim();
    });

    STANDARD_FIELDS.forEach(field => {
       if (record[field.key] === undefined || record[field.key] === '') {
           if (!field.required) record[field.key] = "Unknown";
           else missingValues++;
       }
    });

    if (record.department) record.department = String(record.department).toUpperCase();
    if (record.gender && record.gender !== 'Unknown') {
      const g = String(record.gender).toLowerCase();
      if (g.startsWith('m')) record.gender = 'Male';
      else if (g.startsWith('f')) record.gender = 'Female';
      else record.gender = 'Other';
    }

    if (record.attendance !== "Unknown") {
       const att = parseFloat(record.attendance);
       if (isNaN(att) || att < 0 || att > 100) invalidAttendance++;
       record.attendance = isNaN(att) ? 0 : att;
    }
    if (record.cgpa !== "Unknown") {
       const cgpa = parseFloat(record.cgpa);
       if (isNaN(cgpa) || cgpa < 0 || cgpa > 4.0) invalidCgpa++;
       record.cgpa = isNaN(cgpa) ? 0 : cgpa;
    }
    if (record.finalMarks !== "Unknown") {
       const fm = parseFloat(record.finalMarks);
       if (isNaN(fm) || fm < 0 || fm > 100) invalidMarks++;
       record.finalMarks = isNaN(fm) ? 0 : fm;
    }

    record.result = record.finalMarks >= 50 ? 'Pass' : 'Fail';

    if (record.studentId && record.studentId !== "Unknown") {
       if (seenIds.has(record.studentId)) {
           duplicates++;
           return; 
       }
       seenIds.add(record.studentId);
    }
    cleaned.push(record as StandardizedRecord);
  });

  const validRecords = cleaned.length;
  const score = Math.max(0, 100 - ((missingValues + invalidAttendance + invalidCgpa + duplicates) / (rawData.length || 1)) * 100);

  return {
      cleanedData: cleaned,
      report: {
          totalRecords: rawData.length,
          validRecords,
          missingValues,
          duplicates,
          invalidAttendance,
          invalidCgpa,
          invalidMarks,
          dataQualityScore: score.toFixed(2)
      }
  };
}
