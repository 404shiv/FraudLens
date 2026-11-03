import { useEffect, useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { getDashboardStats } from "../services/api";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import { FaChartPie, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function PieChart({ refreshKey }) {
    const [stats, setStats] = useState({
        total: 0,
        fraud: 0,
        genuine: 0
    });

    useEffect(() => {
        let isMounted = true;
        getDashboardStats()
            .then(data => {
                if (isMounted) {
                    setStats(data);
                }
            })
            .catch(err => {
                console.error("Failed to load chart data:", err);
            });
        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const hasData = stats.total > 0;
    const fraudPct = hasData ? ((stats.fraud / stats.total) * 100).toFixed(1) : 0;
    const genuinePct = hasData ? ((stats.genuine / stats.total) * 100).toFixed(1) : 0;

    const chartData = {
        labels: ["Flagged as Fraud", "Freeze Green Approved"],
        datasets: [
            {
                data: hasData ? [stats.fraud, stats.genuine] : [0, 1],
                backgroundColor: hasData
                    ? ["#f43f5e", "#34d399"] // Rose Red & Freeze Green
                    : ["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.1)"],
                borderColor: [
                    "rgba(15, 20, 29, 0.8)",
                    "rgba(15, 20, 29, 0.8)"
                ],
                borderWidth: 3,
                hoverOffset: 6
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: "rgba(10, 14, 20, 0.95)",
                titleFont: { family: "JetBrains Mono, monospace", size: 12 },
                bodyFont: { family: "Plus Jakarta Sans, sans-serif", size: 11 },
                padding: 12,
                cornerRadius: 12,
                borderColor: "rgba(255, 255, 255, 0.15)",
                borderWidth: 1,
                callbacks: {
                    label: function (context) {
                        const val = context.raw || 0;
                        const pct = stats.total > 0 ? ((val / stats.total) * 100).toFixed(1) : 0;
                        return ` ${context.label}: ${val} (${pct}%)`;
                    }
                }
            }
        }
    };

    return (
        <section className="mb-8">
            <div className="poly-glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                {/* Top Beveled Specular Border: Beach Sand to Freeze Green */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#d4a373] via-[#34d399] to-[#059669]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-[#d4a373]/15 text-[#e2c290] border border-[#e2c290]/30 text-xs shadow-inner">
                                <FaChartPie />
                            </span>
                            <h2 className="text-xl font-black text-white tracking-tight">
                                Threat Vector Telemetry
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            Aggregate distribution of evaluated transactions across system lifetime
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-[#090d14]/80 text-[#e2c290] border border-[#d4a373]/25 shadow-inner">
                            Total Scans: {stats.total}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Donut Chart with Center Metric */}
                    <div className="lg:col-span-5 flex justify-center">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            <Doughnut data={chartData} options={chartOptions} />
                            
                            {/* Center Hologram Metric */}
                            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
                                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400">
                                    Anomaly Load
                                </span>
                                <span className="text-2xl font-black font-mono tracking-tight text-white mt-0.5">
                                    {fraudPct}%
                                </span>
                                <span className="text-[9px] font-mono text-rose-400 font-semibold">
                                    {stats.fraud} Threats Flagged
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown & Legends */}
                    <div className="lg:col-span-7 space-y-3.5">
                        {/* Fraud Card */}
                        <div className="p-4 rounded-2xl bg-[#0f141e]/70 border border-rose-500/25 hover:border-rose-500/50 transition flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/35">
                                    <FaExclamationTriangle className="text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Flagged Transactions
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Flagged as fraud during analysis
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black font-mono text-rose-400">
                                    {stats.fraud}
                                </span>
                                <span className="block text-[11px] text-slate-400 font-mono">
                                    {fraudPct}% share
                                </span>
                            </div>
                        </div>

                        {/* Genuine Card */}
                        <div className="p-4 rounded-2xl bg-[#0f141e]/70 border border-[#10b981]/25 hover:border-[#34d399]/50 transition flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-xl bg-[#10b981]/15 text-[#34d399] border border-[#34d399]/35">
                                    <FaCheckCircle className="text-sm" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white">
                                        Freeze Green Authorized
                                    </h4>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Legitimate transactions safely cleared
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-lg font-black font-mono text-[#34d399]">
                                    {stats.genuine}
                                </span>
                                <span className="block text-[11px] text-slate-400 font-mono">
                                    {genuinePct}% share
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}

export default PieChart;
