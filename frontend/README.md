# FraudLens — Frontend

The web user interface for the Credit Card Fraud Detection system, built with **React 19**, **Vite**, and **Tailwind CSS**.

## Features

- **Live Inference Cockpit**:
  - Interactive prediction form supporting amount, time, and full 28 PCA features (`V1`–`V28`).
  - Pre-curated verified dataset samples (genuine and fraudulent) directly loaded from the backend.
  - "Random Genuine" and "Random Fraud" buttons for on-demand dataset sample generation.
  - Quick scenario presets with illustrative feature vectors.
  - Advanced expandable drawer for manual inspection and modification of PCA features.
  - Ground-truth comparison badge comparing model verdicts against dataset labels.
- **Threat Distribution & Portfolio Balance**:
  - Doughnut chart powered by `Chart.js` / `react-chartjs-2` showing real-time quarantine and clearance ratios.
  - Synchronized with persistent prediction records in MongoDB.
- **Transaction Audit Ledger**:
  - Search by amount or classification verdict.
  - Filter by "All", "Threats", or "Freeze Green".
  - One-click CSV export of the full audit ledger.
  - Safe deletion modal to wipe audit history from MongoDB.
- **Glassmorphism Design System**:
  - Custom obsidian dark palette with warm amber beach sand and glacial freeze green optics.

## Development & Build

### Install Dependencies
```bash
npm install
```

### Run Dev Server
```bash
npm run dev
```
Defaults to `http://localhost:5173`. Make sure the Flask backend is running on `http://127.0.0.1:5000`.

### Production Build
```bash
npm run build
```
Builds static assets into `dist/`.

## Architecture

- [App.jsx](src/App.jsx): Main layout container with ambient glowing background.
- [Home.jsx](src/pages/Home.jsx): Dashboard aggregator connecting form, result, charts, and history.
- [PredictionForm.jsx](src/components/PredictionForm.jsx): Vector inputs, sample loader, and API caller.
- [PredictionResult.jsx](src/components/PredictionResult.jsx): Visual scoring meter, verdict badge, and ground-truth comparison.
- [StatsCards.jsx](src/components/StatsCards.jsx): Key metrics overview.
- [PieChart.jsx](src/components/PieChart.jsx): Anomaly distribution doughnut visualization.
- [HistoryTable.jsx](src/components/HistoryTable.jsx): Audit ledger with filtering, search, and CSV export.
- [api.js](src/services/api.js): Axios client configured for Flask backend API.
