import * as brain from 'brain.js';
import { sampleCorrelation, standardDeviation, mean, linearRegression, linearRegressionLine } from 'simple-statistics';
import { StandardizedRecord } from '../store/dataStore';

export interface MLAnalyzedRecord extends StandardizedRecord {
  riskScore: number;
  riskCategory: 'High' | 'Medium' | 'Low';
  predictedMarks: number;
  cluster: number;
  isOutlier: boolean;
}

export interface MLModelResults {
  records: MLAnalyzedRecord[];
  featureImportance: Record<string, number>;
  accuracy: number;
}

// Simple K-Means Implementation (2D: Attendance, CGPA normalized)
function kMeansClustering(data: number[][], k: number, maxIterations = 100) {
  let centroids = data.slice(0, k).map(d => [...d]);
  let assignments = new Array(data.length).fill(0);
  
  for (let iter = 0; iter < maxIterations; iter++) {
    let changed = false;
    // Assign to closest centroid
    for (let i = 0; i < data.length; i++) {
      let minDist = Infinity;
      let cluster = 0;
      for (let j = 0; j < k; j++) {
        const dist = Math.sqrt(Math.pow(data[i][0] - centroids[j][0], 2) + Math.pow(data[i][1] - centroids[j][1], 2));
        if (dist < minDist) {
          minDist = dist;
          cluster = j;
        }
      }
      if (assignments[i] !== cluster) {
        assignments[i] = cluster;
        changed = true;
      }
    }
    if (!changed) break;
    // Update centroids
    for (let j = 0; j < k; j++) {
      let sumX = 0, sumY = 0, count = 0;
      for (let i = 0; i < data.length; i++) {
        if (assignments[i] === j) {
          sumX += data[i][0];
          sumY += data[i][1];
          count++;
        }
      }
      if (count > 0) {
        centroids[j] = [sumX / count, sumY / count];
      }
    }
  }
  return assignments;
}

export function trainAndApplyMLModels(data: StandardizedRecord[]): MLModelResults {
  if (!data || data.length === 0) return { records: [], featureImportance: {}, accuracy: 0 };

  // 1. Feature Extraction & Normalization
  const attendances = data.map(d => d.attendance);
  const cgpas = data.map(d => d.cgpa);
  const marks = data.map(d => d.finalMarks);
  const studyHours = data.map(d => d.studyHours);

  // 2. Outlier Detection (Z-Score on Marks)
  const marksMean = mean(marks);
  const marksStdDev = standardDeviation(marks) || 1;
  const zScores = marks.map(m => Math.abs((m - marksMean) / marksStdDev));

  // 3. Feature Importance (Correlation with Marks)
  const featureImportance = {
    Attendance: Math.abs(sampleCorrelation(attendances, marks) || 0),
    CGPA: Math.abs(sampleCorrelation(cgpas, marks) || 0),
    StudyHours: Math.abs(sampleCorrelation(studyHours, marks) || 0)
  };

  // 4. Future Performance Prediction (Linear Regression on CGPA -> Marks)
  const regressionData = data.map(d => [d.cgpa, d.finalMarks] as [number, number]);
  const regression = linearRegression(regressionData);
  const predictLine = linearRegressionLine(regression);

  // 5. Neural Network Risk Prediction (brain.js)
  // Generating a pseudo-target for training based on a heuristic, then predicting
  const trainingData = data.map(d => {
    // 0 = low risk, 1 = high risk
    const heuristicRisk = (d.attendance < 75 || d.cgpa < 2.5) ? 1 : (d.attendance >= 85 && d.cgpa >= 3.0 ? 0 : 0.5);
    return {
      input: {
        att: d.attendance / 100,
        cgpa: d.cgpa / 4.0,
        hours: Math.min(d.studyHours / 10, 1)
      },
      output: { risk: heuristicRisk }
    };
  });

  const net = new brain.NeuralNetwork({ hiddenLayers: [4] });
  net.train(trainingData, { iterations: 200, errorThresh: 0.01 });

  // 6. K-Means Clustering (Normalize Attendance 0-1 and CGPA 0-1)
  const clusterData = data.map(d => [d.attendance / 100, d.cgpa / 4.0]);
  const clusters = kMeansClustering(clusterData, 3);

  // 7. Apply to Records
  const analyzedRecords: MLAnalyzedRecord[] = data.map((d, i) => {
    const isOutlier = zScores[i] > 2.5; // Z > 2.5 is a common outlier threshold
    const predictedMarks = Math.min(Math.max(predictLine(d.cgpa), 0), 100);
    
    const prediction = net.run({ att: d.attendance / 100, cgpa: d.cgpa / 4.0, hours: Math.min(d.studyHours / 10, 1) }) as { risk: number };
    const riskScoreRaw = prediction.risk; // 0 to 1
    
    const riskScore = Math.round(riskScoreRaw * 100);
    let riskCategory: 'High' | 'Medium' | 'Low' = 'Medium';
    if (riskScore > 66) riskCategory = 'High';
    else if (riskScore < 33) riskCategory = 'Low';

    return {
      ...d,
      isOutlier,
      predictedMarks,
      cluster: clusters[i],
      riskScore,
      riskCategory
    };
  });

  // Simple accuracy proxy: how often model matches the heuristic
  const matchCount = analyzedRecords.filter((r, i) => {
    const heuristic = (data[i].attendance < 75 || data[i].cgpa < 2.5) ? 'High' : (data[i].attendance >= 85 && data[i].cgpa >= 3.0 ? 'Low' : 'Medium');
    return r.riskCategory === heuristic;
  }).length;
  const accuracy = (matchCount / data.length) * 100;

  return {
    records: analyzedRecords,
    featureImportance,
    accuracy
  };
}
