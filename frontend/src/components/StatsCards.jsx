import { useEffect, useState } from "react";
import { getDashboardStats, getModelMetrics } from "../services/api";
import {
    FaChartBar,
    FaExclamationTriangle,
    FaCheckCircle,
    FaShieldAlt
} from "react-icons/fa";

function StatsCards({ refreshKey }) {
    const [stats, setStats] = useState({
        total: 0,
        fraud: 0,
        genuine: 0
    });
    const [metrics, setMetrics] = useState(null);

    useEffect(() => {
        let isMounted = true;
        getDashboardStats()
            .then(data => {
                if (isMounted) {
                    setStats(data);
                }
            })
            .catch(err => {
                console.error("Failed to load dashboard stats:", err);
            });

        getModelMetrics()
            .then(res => {
                if (isMounted) {
                    setMetrics(res.data);
                }
            })
            .catch(err => {
                console.error("Failed to load model metrics:", err);
            });

        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const fraudRate = stats.total > 0 
        ? ((stats.fraud / stats.total) * 100).toFixed(1) 
        : "0.0";
    
    const genuineRate = stats.total > 0 
        ? ((stats.genuine / stats.total) * 100).toFixed(1) 
        : "0.0";

    const prAucValue = metrics && metrics.pr_auc !== undefined
        ? `${(metrics.pr_auc * 100).toFixed(1)}%`
        : "Metrics unavailable";

    const metricsSubtitle = metrics && metrics.precision !== undefined && metrics.recall !== undefined
        ? `Prec: ${(metrics.precision * 100).toFixed(1)}% • Rec: ${(metrics.recall * 100).toFixed(1)}%`
        : "Evaluating metrics...";

    const cards = [
        {
            title: "Total Transactions",
            value: stats.total.toLocaleString(),
            subtitle: "Processed in Database",
            icon: FaChartBar,
            accentColor: "from-[#e2c290] via-[#c89666] to-[#78593a]",
            numberColor: "text-[#f5eedc]",
            iconBg: "bg-[#d4a373]/15 border-[#e2c290]/30 text-[#e2c290] shadow-[0_0_15px_rgba(212,163,115,0.2)]",
            pillBg: "bg-[#d4a373]/10 border-[#d4a373]/25 text-[#e2c290]",
            pill: "Dune Ledger"
        },
        {
            title: "Flagged as Fraud",
            value: stats.fraud.toLocaleString(),
            subtitle: `${fraudRate}% Anomaly Ratio`,
            icon: FaExclamationTriangle,
            accentColor: "from-rose-500 via-amber-600 to-red-600",
            numberColor: "text-rose-400",
            iconBg: "bg-rose-500/15 border-rose-500/35 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]",
            pillBg: "bg-rose-500/10 border-rose-500/25 text-rose-300",
            pill: stats.fraud > 0 ? "Flagged" : "Zero Threats"
        },
        {
            title: "Freeze Green Verified",
            value: stats.genuine.toLocaleString(),
            subtitle: `${genuineRate}% Clearance Rate`,
            icon: FaCheckCircle,
            accentColor: "from-[#34d399] via-[#10b981] to-[#047857]",
            numberColor: "text-[#34d399]",
            iconBg: "bg-[#10b981]/15 border-[#34d399]/40 text-[#34d399] shadow-[0_0_15px_rgba(52,211,153,0.25)]",
            pillBg: "bg-[#10b981]/10 border-[#10b981]/25 text-[#34d399]",
            pill: "Glacial Settlement"
        },
        {
            title: "PR-AUC (Fraud Metric)",
            value: prAucValue,
            subtitle: metricsSubtitle,
            icon: FaShieldAlt,
            accentColor: "from-white via-slate-300 to-slate-500",
            numberColor: "text-white",
            iconBg: "bg-white/10 border-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.15)]",
            pillBg: "bg-white/5 border-white/15 text-slate-300",
            pill: metrics?.optimal_threshold ? `T = ${metrics.optimal_threshold}` : "Demo Engine"
        }
    ];

    return (
        <section className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div
                            key={idx}
                            className="poly-glass-card rounded-2xl p-5 relative overflow-hidden group"
                        >
                            {/* Top decorative beveled specular bar */}
                            <div className={`absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r ${card.accentColor}`} />

                            <div className="flex items-start justify-between">
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                        {card.title}
                                    </span>
                                    <h3 className={`text-3xl font-black mt-1.5 font-mono tracking-tight ${card.numberColor}`}>
                                        {card.value}
                                    </h3>
                                </div>
                                <div className={`p-3 rounded-2xl border ${card.iconBg} group-hover:scale-105 transition-transform duration-200`}>
                                    <Icon className="text-xl" />
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                                <span className="text-slate-400 font-medium">
                                    {card.subtitle}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${card.pillBg}`}>
                                    {card.pill}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-mono flex items-center gap-1.5">
                <span className="text-[#e2c290] font-bold">*</span>
                <span>Accuracy is not shown because 99.83% of transactions are genuine.</span>
            </p>
        </section>
    );
}

export default StatsCards;
