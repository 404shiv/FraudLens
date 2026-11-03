import { useState } from "react";
import StatsCards from "../components/StatsCards";
import PredictionForm from "../components/PredictionForm";
import PredictionResult from "../components/PredictionResult";
import HistoryTable from "../components/HistoryTable";
import PieChart from "../components/PieChart";
import { FaShieldAlt, FaLock } from "react-icons/fa";

function Home() {
    const [result, setResult] = useState(null);
    // This value increments whenever a prediction is made or cleared
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePrediction = (predictionResult) => {
        setResult(predictionResult);
        // Force StatsCards, PieChart, and HistoryTable to reload
        setRefreshKey(prev => prev + 1);
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {/* Hero Sub-header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#d4a373]/15 via-[#34d399]/15 to-[#059669]/15 border border-white/15 text-[#f5eedc] text-xs font-mono font-bold mb-3 shadow-inner">
                        <FaShieldAlt className="text-[#e2c290]" />
                        <span>Real-Time Anomaly & Fraud Flagging</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight font-sans">
                        <span>Transaction Risk </span>
                        <span className="bg-gradient-to-r from-[#e2c290] via-[#f5e6d3] to-[#34d399] bg-clip-text text-transparent">
                            Intelligence
                        </span>
                    </h2>
                    <p className="text-sm text-slate-400 mt-1.5 max-w-2xl leading-relaxed font-medium">
                        Analyze financial streams against a Random Forest classifier with SMOTE rebalancing, styled in obsidian glass and freeze green optics.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="poly-glass-panel px-4 py-2 rounded-2xl text-xs text-[#e2c290] flex items-center gap-2 font-mono shadow-inner border-[#d4a373]/30">
                        <FaLock className="text-[#34d399] text-xs" />
                        <span>Real-Time Transaction Scoring</span>
                    </div>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <StatsCards refreshKey={refreshKey} />

            {/* Prediction Studio Cockpit (Side-by-side 2-column on desktop) */}
            <section className="mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    <div className="lg:col-span-7">
                        <PredictionForm setResult={handlePrediction} />
                    </div>
                    <div className="lg:col-span-5">
                        <PredictionResult result={result} />
                    </div>
                </div>
            </section>

            {/* Threat Distribution Analytics */}
            <PieChart refreshKey={refreshKey} />

            {/* Audit History Table */}
            <HistoryTable refreshKey={refreshKey} />
        </main>
    );
}

export default Home;