import { useEffect, useState } from "react";
import {
    getHistory,
    clearHistory
} from "../services/api";
import {
    FaHistory,
    FaSearch,
    FaDownload,
    FaTrashAlt,
    FaCheckCircle,
    FaExclamationTriangle,
    FaDatabase
} from "react-icons/fa";

function HistoryTable({ refreshKey }) {
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'fraud', 'genuine'
    const [showClearModal, setShowClearModal] = useState(false);

    useEffect(() => {
        let isMounted = true;
        getHistory()
            .then(res => {
                if (isMounted) {
                    setHistory(res.data);
                }
            })
            .catch(err => {
                console.error("Failed to load history:", err);
            });
        return () => {
            isMounted = false;
        };
    }, [refreshKey]);

    const handleClear = async () => {
        if (!window.confirm("Delete all records from the ledger? This cannot be undone.")) {
            return;
        }
        try {
            await clearHistory();
            setHistory([]);
            setShowClearModal(false);
        } catch (error) {
            console.error("Failed to clear history:", error);
            alert("Failed to clear history from database.");
        }
    };

    const handleDownload = async () => {
        try {
            const response = await getHistory();
            const historyData = response.data;

            if (!historyData || historyData.length === 0) {
                alert("No history records available to export.");
                return;
            }

            const headers = Object.keys(historyData[0]);
            const rows = historyData.map(item =>
                headers.map(header => {
                    const val = item[header];
                    if (val === null || val === undefined) return '""';
                    const str = typeof val === "object" ? JSON.stringify(val) : String(val);
                    return `"${str.replace(/"/g, '""')}"`;
                }).join(",")
            );

            const csv = [headers.join(","), ...rows].join("\n");
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `fraudlens_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
            alert("Error exporting history.");
        }
    };

    const filteredHistory = history.filter(item => {
        const isFraud = item.prediction === 1;
        const matchesStatus =
            filterStatus === "all" ||
            (filterStatus === "fraud" && isFraud) ||
            (filterStatus === "genuine" && !isFraud);

        const amountStr = (item.Amount !== undefined ? item.Amount.toString() : "");
        const statusStr = isFraud ? "fraud" : "genuine";
        const matchesSearch =
            amountStr.includes(search) ||
            statusStr.includes(search.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    const fraudCount = history.filter(h => h.prediction === 1).length;
    const genuineCount = history.filter(h => h.prediction === 0).length;

    return (
        <section className="mb-12">
            <div className="poly-glass-panel rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                {/* Top Beveled Specular Border: Beach Sand to Freeze Green */}
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#d4a373] via-[#e2c290] to-[#34d399]" />

                {/* Header & Main Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-xl bg-[#d4a373]/15 text-[#e2c290] border border-[#e2c290]/30 text-xs shadow-inner">
                                <FaHistory />
                            </span>
                            <h2 className="text-xl font-black text-white tracking-tight">
                                Transaction Audit Ledger
                            </h2>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 font-medium">
                            Persistent records securely journaled in local MongoDB collection
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {/* Beach Sand Poly-Glass Export Button */}
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={history.length === 0}
                            className="poly-btn-sand px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                        >
                            <FaDownload className="text-[#e2c290] text-xs" />
                            <span>Export CSV</span>
                        </button>

                        {/* Ember Rose Clear Button */}
                        <button
                            type="button"
                            onClick={handleClear}
                            disabled={history.length === 0}
                            className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-rose-300 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-sm"
                        >
                            <FaTrashAlt className="text-xs" />
                            <span>Clear Ledger</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#d4a373] text-xs" />
                        <input
                            type="text"
                            placeholder="Search by amount or status (fraud / genuine)..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="poly-glass-input w-full rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-400 font-sans"
                        />
                    </div>

                    {/* Filter Status Pills */}
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#090d14]/90 border border-white/[0.08] shadow-inner">
                        <button
                            type="button"
                            onClick={() => setFilterStatus("all")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer ${
                                filterStatus === "all"
                                    ? "bg-[#d4a373]/25 text-[#f5eedc] border border-[#e2c290]/40 shadow-sm"
                                    : "text-slate-400 hover:text-white"
                            }`}
                        >
                            All ({history.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus("fraud")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                filterStatus === "fraud"
                                    ? "bg-rose-500/25 text-rose-200 border border-rose-500/40 shadow-sm"
                                    : "text-slate-400 hover:text-rose-400"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>
                            Threats ({fraudCount})
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilterStatus("genuine")}
                            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                filterStatus === "genuine"
                                    ? "bg-[#10b981]/25 text-[#6ee7b7] border border-[#34d399]/40 shadow-sm"
                                    : "text-slate-400 hover:text-[#34d399]"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] shadow-[0_0_6px_rgba(52,211,153,0.8)]"></span>
                            Freeze Green ({genuineCount})
                        </button>
                    </div>
                </div>

                {/* Table or Empty State */}
                {history.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-white/10 bg-[#090d14]/40">
                        <FaDatabase className="mx-auto text-[#d4a373] text-3xl mb-3 opacity-60" />
                        <h4 className="text-sm font-bold text-slate-200">
                            No Transactions Journaled Yet
                        </h4>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 font-medium">
                            Execute an AI fraud analysis above or pick a quick scenario chip to generate persistent audit records in MongoDB.
                        </p>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-10 px-4 rounded-2xl border border-dashed border-white/10 bg-[#090d14]/40">
                        <p className="text-xs text-slate-400 font-medium">
                            No transaction records matching filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-2xl border border-white/[0.08] shadow-inner">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-[#090d14]/90 text-slate-400 font-mono uppercase tracking-wider text-[11px] border-b border-white/[0.08]">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">#</th>
                                    <th className="py-3.5 px-4 font-bold">Transaction Value</th>
                                    <th className="py-3.5 px-4 font-bold">Verdict</th>
                                    <th className="py-3.5 px-4 font-bold">Confidence in verdict</th>
                                    <th className="py-3.5 px-4 font-bold text-right">Confidence Breakdown</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.05] bg-[#0c1018]/50 font-sans">
                                {filteredHistory.map((item, index) => {
                                    const isFraud = item.prediction === 1;
                                    const fraudPct = (item.fraud_probability * 100).toFixed(1);
                                    const genuinePct = (item.genuine_probability * 100).toFixed(1);

                                    return (
                                        <tr
                                            key={index}
                                            className="hover:bg-[#141b27]/70 transition duration-150 group"
                                        >
                                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                                                {String(filteredHistory.length - index).padStart(2, '0')}
                                            </td>

                                            <td className="py-3.5 px-4 font-mono font-black text-[#f5eedc] text-sm">
                                                ${Number(item.Amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>

                                            <td className="py-3.5 px-4">
                                                {isFraud ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/35 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
                                                        <FaExclamationTriangle className="text-[10px]" />
                                                        Flagged as Fraud
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#10b981]/20 text-[#6ee7b7] border border-[#34d399]/35 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                                                        <FaCheckCircle className="text-[10px]" />
                                                        Freeze Green Safe
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3.5 px-4 min-w-[130px]">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 rounded-full bg-[#161c26] overflow-hidden border border-white/[0.06]">
                                                        <div
                                                            className={`h-full rounded-full ${
                                                                isFraud ? "bg-gradient-to-r from-rose-500 to-amber-600" : "bg-gradient-to-r from-[#34d399] to-[#059669]"
                                                            }`}
                                                            style={{ width: `${isFraud ? fraudPct : genuinePct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`font-mono text-[10px] font-bold ${
                                                        isFraud ? "text-rose-400" : "text-[#34d399]"
                                                    }`}>
                                                        {isFraud ? `${fraudPct}%` : `${genuinePct}%`}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-4 text-right font-mono text-[11px]">
                                                <span className="text-rose-400 font-bold">{fraudPct}% Threat</span>
                                                <span className="text-slate-500 mx-1.5">/</span>
                                                <span className="text-[#34d399] font-bold">{genuinePct}% Safe</span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Footer Count */}
                {history.length > 0 && (
                    <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
                        <span>
                            Displaying <strong className="text-[#f5eedc]">{filteredHistory.length}</strong> of {history.length} audit logs
                        </span>
                        <span className="font-mono text-[11px] text-[#d4a373]">
                            Audit Ledger • Local MongoDB
                        </span>
                    </div>
                )}
            </div>

            {/* Clear History Confirmation Modal */}
            {showClearModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="poly-glass-elevated max-w-sm w-full p-6 rounded-3xl border-rose-500/40 glow-amber-rose text-center">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-xl shadow-inner">
                            <FaTrashAlt />
                        </div>
                        <h3 className="text-lg font-black text-white mb-2">
                            Clear Audit Ledger?
                        </h3>
                        <p className="text-xs text-slate-300 mb-6 leading-relaxed font-medium">
                            This will permanently delete all {history.length} transaction prediction records from your local MongoDB collection. This action cannot be reversed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowClearModal(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-slate-300 bg-white/[0.06] hover:bg-white/[0.12] transition border border-white/10 cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-mono font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-[0_0_20px_rgba(225,29,72,0.4)] cursor-pointer"
                            >
                                Delete All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default HistoryTable;
