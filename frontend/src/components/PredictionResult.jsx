import {
    FaShieldAlt,
    FaExclamationTriangle,
    FaCheckCircle,
    FaMicrochip,
    FaClock,
    FaDatabase,
    FaFlask
} from "react-icons/fa";

function PredictionResult({ result }) {
    if (!result) {
        return (
            <div className="poly-glass-panel rounded-3xl p-6 sm:p-7 h-full flex flex-col items-center justify-center text-center min-h-[380px] border-dashed border-white/15 relative overflow-hidden">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#e2c290]/20 to-[#34d399]/20 border border-white/20 flex items-center justify-center mb-4 text-[#e2c290] text-2xl shadow-inner">
                    <FaShieldAlt className="drop-shadow-sm" />
                </div>
                <h3 className="text-lg font-black text-white mb-1 tracking-tight">
                    Defense Radar Standby
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
                    Submit an amount or choose a quick scenario chip to evaluate behavioral anomaly vectors in real time.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-[#34d399] px-3.5 py-1.5 rounded-full bg-[#10b981]/10 border border-[#34d399]/30 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-[#34d399] animate-ping"></span>
                    <span>Ready for Inference</span>
                </div>
            </div>
        );
    }

    const isFraud = result.prediction === 1;
    const fraudPct = (result.fraud_probability * 100).toFixed(1);
    const genuinePct = (result.genuine_probability * 100).toFixed(1);

    const hasDatasetLabel = result.datasetLabel !== null && result.datasetLabel !== undefined;
    const datasetIsFraud = result.datasetLabel === 1;
    const predictionMatchesLabel = hasDatasetLabel && result.prediction === result.datasetLabel;

    return (
        <div className={`poly-glass-elevated rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-500 ${
            isFraud ? "glow-amber-rose border-rose-500/50" : "glow-freeze border-[#34d399]/50"
        }`}>
            {/* Top Beveled Specular Bar */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${
                isFraud 
                    ? "bg-gradient-to-r from-rose-500 via-amber-600 to-red-600" 
                    : "bg-gradient-to-r from-[#e2c290] via-[#34d399] to-[#059669]"
            }`} />

            {/* Verdict Header */}
            <div className="flex items-start justify-between gap-4 mb-5">
                <div>
                    <span className={`text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full border shadow-sm ${
                        isFraud 
                            ? "bg-rose-500/25 border-rose-400 text-rose-200"
                            : "bg-[#10b981]/25 border-[#34d399] text-[#a7f3d0]"
                    }`}>
                        {isFraud ? "CRITICAL ANOMALY" : "CLEARED GENUINE"}
                    </span>
                    <h3 className={`text-2xl font-black tracking-tight mt-2 flex items-center gap-2 ${
                        isFraud ? "text-rose-400" : "text-[#34d399]"
                    }`}>
                        {isFraud ? (
                            <>
                                <FaExclamationTriangle className="text-xl" />
                                <span>High-Risk Fraud</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="text-xl" />
                                <span>Verified Genuine</span>
                            </>
                        )}
                    </h3>
                </div>

                <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Analyzed Value</span>
                    <span className="text-xl font-black font-mono text-[#f5eedc]">
                        {result.currency || "$"}{Number(result.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                </div>
            </div>

            {/* Dataset Label Comparison (shown when a dataset sample was used) */}
            {hasDatasetLabel && (
                <div className={`p-3.5 rounded-2xl border text-xs mb-5 flex items-start gap-3 shadow-sm ${
                    predictionMatchesLabel
                        ? "bg-[#064e3b]/35 border-[#34d399]/40 text-[#a7f3d0]"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                }`}>
                    <div className="mt-0.5 text-base">
                        <FaFlask />
                    </div>
                    <div>
                        <span className="font-bold block mb-0.5 uppercase tracking-wider text-[11px]">
                            Dataset Label vs Model Prediction
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1.5 mb-1.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                datasetIsFraud
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                    : "bg-[#10b981]/15 text-[#6ee7b7] border-[#34d399]/30"
                            }`}>
                                Dataset: {datasetIsFraud ? "Fraud" : "Genuine"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                isFraud
                                    ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                    : "bg-[#10b981]/15 text-[#6ee7b7] border-[#34d399]/30"
                            }`}>
                                Model: {isFraud ? "Fraud" : "Genuine"}
                            </span>
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border ${
                                predictionMatchesLabel
                                    ? "bg-[#10b981]/15 text-[#6ee7b7] border-[#34d399]/30"
                                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                            }`}>
                                {predictionMatchesLabel ? "✓ Match" : "✗ Mismatch"}
                            </span>
                        </div>
                        <span className="text-slate-300 text-[11px] leading-relaxed font-sans">
                            {predictionMatchesLabel
                                ? "The model's prediction matches the dataset's known label for this transaction."
                                : "The model's prediction differs from the dataset's known label. This can happen due to model accuracy limitations."}
                        </span>
                    </div>
                </div>
            )}

            {/* Probability Progress Meters */}
            <div className="space-y-4 mb-6 p-4 rounded-2xl bg-[#090d14]/90 border border-white/[0.08] shadow-inner">
                {/* Fraud Probability */}
                <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                        <span className="font-bold text-rose-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                            Fraud Threat Score
                        </span>
                        <span className="font-bold text-rose-400 text-sm">
                            {fraudPct}%
                        </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#161c26] overflow-hidden p-0.5 border border-white/[0.06]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-600 transition-all duration-700 ease-out shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                            style={{ width: `${Math.max(Number(fraudPct), 3)}%` }}
                        />
                    </div>
                </div>

                {/* Genuine Probability */}
                <div>
                    <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
                        <span className="font-bold text-[#6ee7b7] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                            Freeze Green Confidence
                        </span>
                        <span className="font-bold text-[#34d399] text-sm">
                            {genuinePct}%
                        </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#161c26] overflow-hidden p-0.5 border border-white/[0.06]">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-[#34d399] to-[#059669] transition-all duration-700 ease-out shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                            style={{ width: `${Math.max(Number(genuinePct), 3)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Protocol Recommendation Box */}
            <div className={`p-4 rounded-2xl border text-xs mb-5 flex items-start gap-3 shadow-sm ${
                isFraud 
                    ? "bg-rose-950/40 border-rose-500/40 text-rose-200" 
                    : "bg-[#064e3b]/35 border-[#34d399]/40 text-[#a7f3d0]"
            }`}>
                <div className="mt-0.5 text-lg">
                    {isFraud ? "⚠️" : "🛡️"}
                </div>
                <div>
                    <span className="font-bold block mb-0.5 uppercase tracking-wider text-[11px]">
                        {isFraud ? "Flagged for manual review:" : "Automated Approval Granted:"}
                    </span>
                    <span className="text-slate-300 text-[11px] leading-relaxed font-sans">
                        {isFraud 
                            ? "Flagged for manual review. Require cardholder verification before authorizing transaction."
                            : "Confidence threshold satisfied. Transaction approved for zero-friction instant settlement."}
                    </span>
                </div>
            </div>

            {/* Audit Meta Footer */}
            <div className="pt-3 border-t border-white/[0.08] grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-1.5">
                    <FaClock className="text-[#d4a373]" />
                    <span>{result.timestamp || "Just now"}</span>
                </div>
                <div className="flex items-center gap-1.5 justify-center">
                    <FaMicrochip className="text-[#e2c290]" />
                    <span>Random Forest</span>
                </div>
                <div className={`flex items-center gap-1.5 justify-end ${result.saved === true ? "text-[#34d399]" : "text-amber-400"}`}>
                    <FaDatabase />
                    <span>{result.saved === true ? "Saved to MongoDB" : "Not saved (database offline)"}</span>
                </div>
            </div>
        </div>
    );
}

export default PredictionResult;
