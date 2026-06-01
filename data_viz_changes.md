# Data Visualization & ML Platform Upgrade
**Project:** Student Analytics Dashboard Generator
**Goal:** Transform basic dashboard into a professional Data Viz & ML Analytics Platform.

## 1. Machine Learning Integration
- **Dependency Added:** `brain.js`, `simple-statistics`
- **File Created:** `src/utils/mlEngine.ts`
  - **Neural Network:** Replaced hardcoded rules with a dynamic `brain.js` Neural Network trained on Attendance, CGPA, and Study Hours to predict Risk Scores.
  - **K-Means Clustering:** Implemented a clustering algorithm to group students based on behavioral patterns.
  - **Linear Regression:** Implemented prediction for Future Performance (predicting Marks from CGPA).
  - **Outlier Detection:** Used Z-Score statistical analysis to flag anomalies.
  - **Feature Importance:** Calculated using Pearson correlation coefficients.

## 2. Advanced Data Visualizations (Recharts)
- **File Modified:** `src/pages/DashboardPage.tsx`
  - **Scatter/Bubble Chart:** Plotted CGPA vs Attendance with bubble size mapped to Study Hours.
  - **Radar Chart:** Displays an average multi-dimensional student performance profile.
  - **Composed Chart:** Overlaid Bar Chart (Final Marks) with Line Chart (AI Risk Score).
  - **Area Chart:** Visualized Actual Marks vs ML Predicted Marks indicating trend predictions.
  - **Treemap:** Showcased the hierarchical distribution of students across Departments.
  - **Animated Transitions:** Included natively within Recharts configurations.

## 3. UI/UX & Interactive Features
- **File Modified:** `src/pages/DashboardPage.tsx`
  - Added a modern glassmorphism header and background blur.
  - Implemented a **Dynamic Filtering System**: Filter by Department, K-Means Cluster, and Text Search.
  - Enhanced Tooltips across all charts.

## 4. AI Insights Section
- Developed a completely new **AI Analytics Insights Panel** on the Dashboard with dark mode styling, featuring:
  - Dynamic Feature Importance percentages.
  - Live Risk Analysis and Model Accuracy reporting.
  - K-Means Clustering breakdown.
  - Anomaly Detection (Outliers count).

## 5. Export Functionality
- **Dependency Added:** `html2canvas`
- Implemented **Export Dashboard PNG** to allow downloading the visual analytics as a snapshot.
- Kept the existing PDF and CSV export functionalities intact in the `ExportReportPage`.

## 6. Architecture Overview
- `mlEngine.ts` acts as the computational core.
- `dataStore.ts` was updated to retain the `mlResults` in memory and avoid re-training the model on every render.
- All other analytical pages (`ComparativeAnalysisPage`, `ExportReportPage`, `RecommendationsPage`) were refactored to read from the newly generated `mlResults.records` rather than the old `applyRiskEngine` heuristic.

## Verification Steps
1. Navigate to the App and upload a dataset.
2. Observe the "Training ML Models..." loading state while `brain.js` runs.
3. Verify the Scatter, Radar, Area, and Treemap charts render correctly.
4. Use the "Export Dashboard PNG" button and verify the image download.
5. Review the AI Analytics Insights panel for accurate accuracy and correlation percentages.
