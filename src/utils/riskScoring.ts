import { StandardizedRecord } from '../store/dataStore';

export interface RiskAnalyzedRecord extends StandardizedRecord {
  riskCategory: 'High' | 'Medium' | 'Low';
  riskScore: number;
  mainReason: string;
  recommendedAction: string;
}

export function applyRiskEngine(data: StandardizedRecord[]): RiskAnalyzedRecord[] {
  return data.map(record => {
    let riskCategory: 'High' | 'Medium' | 'Low' = 'Medium';
    let riskScore = 50;
    let mainReason = '';
    let recommendedAction = '';

    const { attendance, cgpa, finalMarks, stressLevel, studyHours, feeStatus } = record;
    const isHighStress = String(stressLevel).toLowerCase() === 'high';

    if (attendance < 75 || cgpa < 2.5 || finalMarks < 50 || (isHighStress && studyHours < 2)) {
      riskCategory = 'High';
      riskScore = Math.floor(85 + Math.random() * 15); 
      
      if (attendance < 75) {
        mainReason = 'Low Attendance';
        recommendedAction = 'Send attendance warning and mentoring support';
      } else if (cgpa < 2.5) {
        mainReason = 'Low CGPA';
        recommendedAction = 'Assign academic advisor';
      } else if (finalMarks < 50) {
        mainReason = 'Failing Grades';
        recommendedAction = 'Remedial classes required';
      } else {
        mainReason = 'High Stress & Low Study Hours';
        recommendedAction = 'Recommend counselling and study plan';
      }
    } 
    else if (attendance >= 85 && cgpa >= 3.0 && finalMarks >= 65) {
      riskCategory = 'Low';
      riskScore = Math.floor(Math.random() * 30);
      mainReason = 'Stable Performance';
      recommendedAction = 'Continue current performance';
    }
    else {
      riskCategory = 'Medium';
      riskScore = Math.floor(40 + Math.random() * 30);
      if (cgpa < 3.0) {
        mainReason = 'Average CGPA';
        recommendedAction = 'Encourage group study';
      } else if (attendance < 85) {
        mainReason = 'Average Attendance';
        recommendedAction = 'Monitor attendance';
      } else {
        mainReason = 'Average Marks';
        recommendedAction = 'Provide additional practice resources';
      }
    }

    if (String(feeStatus).toLowerCase() === 'pending' && riskCategory !== 'High') {
       if (mainReason === 'Stable Performance') mainReason = 'Fee Pending';
       else mainReason += ' & Fee Pending';
       recommendedAction = 'Financial support follow-up';
    }

    return { ...record, riskCategory, riskScore, mainReason, recommendedAction };
  });
}
