import { useState, useEffect } from "react";
import { predictTransaction, getSampleTransactions, getRandomSample } from "../services/api";
import {
    FaBolt,
    FaSlidersH,
    FaUndo,
    FaArrowRight,
    FaCoffee,
    FaShoppingBag,
    FaExclamationTriangle,
    FaLaptop,
    FaFlask,
    FaDice,
    FaInfoCircle
} from "react-icons/fa";

const PRESETS = [
    {
        name: "Morning Beach Café",
        amount: "4.50",
        type: "genuine",
        icon: FaCoffee,
        badge: "Low Risk",
        features: {}
    },
    {
        name: "Electronics Store",
        amount: "849.00",
        type: "genuine",
        icon: FaLaptop,
        badge: "Normal",
        features: {}
    },
    {
        name: "High-Risk Overseas Wire",
        amount: "1850.00",
        type: "fraud",
        icon: FaExclamationTriangle,
        badge: "Suspicious Vector",
        features: {
            Time: 406.0,
            V1: -3.0,
            V2: 2.5,
            V3: -3.5,
            V4: 5.0,
            V10: -5.5,
            V11: 4.5,
            V12: -7.0,
            V14: -8.5,
            V16: -3.0,
            V17: -6.0
        }
    },
    {
        name: "Organic Coastal Market",
        amount: "128.50",
        type: "genuine",
        icon: FaShoppingBag,
        badge: "Standard",
        features: {}
    }
];

function PredictionForm({ setResult }) {
    const [amount, setAmount] = useState("");
    const [timeValue, setTimeValue] = useState("");
    const [currency, setCurrency] = useState("$");
    const [loading, setLoading] = useState(false);
    const [activePreset, setActivePreset] = useState(null);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [pcaValues, setPcaValues] = useState({});

    // Dataset sample testing
    const [datasetSamples, setDatasetSamples] = useState([]);
    const [loadingSamples, setLoadingSamples] = useState(true);
    const [activeSampleIdx, setActiveSampleIdx] = useState(null);
    const [sampleLabel, setSampleLabel] = useState(null); // known label from dataset
    const [loadingRandom, setLoadingRandom] = useState(false);
    const [sampleSourceLoaded, setSampleSourceLoaded] = useState(false);
    const [vMismatchWarning, setVMismatchWarning] = useState(false);

    // Load dataset samples on mount
    useEffect(() => {
        let isMounted = true;
        getSampleTransactions()
            .then(response => {
                if (isMounted) {
                    setDatasetSamples(response.data);
                }
            })
            .catch(err => {
                console.error("Failed to load dataset samples:", err);
            })
            .finally(() => {
                if (isMounted) {
                    setLoadingSamples(false);
                }
            });
        return () => {
            isMounted = false;
        };
    }, []);

    const handleApplyPreset = (preset) => {
        setActivePreset(preset.name);
        setActiveSampleIdx(null);
        setSampleLabel(null);
        setSampleSourceLoaded(false);
        setVMismatchWarning(false);
        setAmount(preset.amount);
        setTimeValue(preset.features?.Time !== undefined ? String(preset.features.Time) : "");
        const feats = { ...preset.features };
        delete feats.Time;
        setPcaValues(feats);
    };

    const handleApplyDatasetSample = (sample, idx) => {
        setActiveSampleIdx(idx);
        setActivePreset(null);
        setSampleLabel(sample.label);
        setSampleSourceLoaded(true);
        setVMismatchWarning(false);
        setAmount(String(sample.features.Amount));
        setTimeValue(String(sample.features.Time));

        const feats = {};
        for (let i = 1; i <= 28; i++) {
            const key = `V${i}`;
            if (sample.features[key] !== undefined) {
                feats[key] = sample.features[key];
            }
        }
        setPcaValues(feats);
    };

    const handleLoadRandomSample = async (type) => {
        setLoadingRandom(true);
        try {
            const response = await getRandomSample(type);
            const sample = response.data;
            setActiveSampleIdx(null);
            setActivePreset(null);
            setSampleLabel(sample.label);
            setSampleSourceLoaded(true);
            setVMismatchWarning(false);
            setAmount(String(sample.features.Amount));
            setTimeValue(String(sample.features.Time));

            const feats = {};
            for (let i = 1; i <= 28; i++) {
                const key = `V${i}`;
                if (sample.features[key] !== undefined) {
                    feats[key] = sample.features[key];
                }
            }
            setPcaValues(feats);
        } catch (error) {
            console.error("Failed to load random sample:", error);
            alert("Failed to load random sample. Ensure the backend is running.");
        } finally {
            setLoadingRandom(false);
        }
    };

    const handlePcaChange = (key, val) => {
        setPcaValues(prev => ({
            ...prev,
            [key]: parseFloat(val) || 0
        }));
    };

    const handleReset = () => {
        setAmount("");
        setTimeValue("");
        setActivePreset(null);
        setActiveSampleIdx(null);
        setSampleLabel(null);
        setPcaValues({});
        setSampleSourceLoaded(false);
        setVMismatchWarning(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numAmount = parseFloat(amount);
        if (!amount || isNaN(numAmount) || numAmount < 0) {
            alert("Please enter a valid transaction amount (0 or greater).");
            return;
        }

        setLoading(true);

        try {
            // Build 30-feature vector expected by Random Forest
            const transaction = {
                Time: timeValue !== "" ? parseFloat(timeValue) || 0 : (pcaValues.Time || 0),
                Amount: numAmount
            };

            for (let i = 1; i <= 28; i++) {
                const key = `V${i}`;
                transaction[key] = pcaValues[key] !== undefined ? Number(pcaValues[key]) : 0;
            }

            if (sampleLabel !== null && sampleLabel !== undefined) {
                transaction.source = "dataset_sample";
                transaction.true_label = sampleLabel;
            } else if (activePreset) {
                transaction.source = "preset";
            } else {
                transaction.source = "manual";
            }

            const response = await predictTransaction(transaction);
            
            // Enrich result with submitted amount and currency for display
            setResult({
                ...response.data,
                amount: numAmount,
                currency,
                presetUsed: activePreset,
                datasetLabel: sampleLabel,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            });

        } catch (error) {
            console.error("Prediction failed:", error);
            alert("API connection failed. Please ensure the backend server is running.");
        } finally {
            setLoading(false);
        }
    };

    // Determine if the user has only entered an amount (no PCA features filled)
    const isAmountOnly = Object.keys(pcaValues).length === 0 && sampleLabel === null;

    return (
        <div className="poly-glass-elevated rounded-3xl p-6 sm:p-7 relative overflow-hidden">
            {/* Top Beveled Specular Border: Beach Sand to Freeze Green */}
            <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#e2c290] via-[#34d399] to-[#059669]" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-[#d4a373]/15 text-[#e2c290] border border-[#e2c290]/30 text-xs shadow-inner">
                            <FaBolt />
                        </span>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            Live Inference Engine
                        </h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        Instant scoring through Random Forest ML with SMOTE class balancing
                    </p>
                </div>

                {(amount || timeValue || Object.keys(pcaValues).length > 0) && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="self-start sm:self-auto text-xs text-[#e2c290] hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 transition active:scale-95 cursor-pointer"
                    >
                        <FaUndo className="text-[10px]" /> Reset Form
                    </button>
                )}
            </div>

            {/* Dataset Sample Testing Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <FaFlask className="text-[#34d399] text-xs" />
                        Verified Dataset Samples:
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handleLoadRandomSample("genuine")}
                            disabled={loadingRandom}
                            className="text-[10px] font-mono text-[#34d399] hover:text-white px-2 py-1 rounded-lg bg-[#10b981]/10 border border-[#34d399]/25 hover:border-[#34d399]/50 transition cursor-pointer disabled:opacity-40"
                        >
                            <FaDice className="inline mr-1 text-[9px]" />Random Genuine
                        </button>
                        <button
                            type="button"
                            onClick={() => handleLoadRandomSample("fraud")}
                            disabled={loadingRandom}
                            className="text-[10px] font-mono text-rose-400 hover:text-white px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/25 hover:border-rose-500/50 transition cursor-pointer disabled:opacity-40"
                        >
                            <FaDice className="inline mr-1 text-[9px]" />Random Fraud
                        </button>
                    </div>
                </div>
                {loadingSamples ? (
                    <div className="text-xs text-slate-400 font-mono py-3 text-center">Loading dataset samples...</div>
                ) : datasetSamples.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {datasetSamples.map((sample, idx) => {
                            const isFraud = sample.label === 1;
                            const isSelected = activeSampleIdx === idx;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => handleApplyDatasetSample(sample, idx)}
                                    className={`text-left p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-95 ${
                                        isSelected
                                            ? isFraud
                                                ? "bg-rose-500/25 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                                                : "bg-[#10b981]/25 border-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                                            : "bg-[#121620]/60 border-white/[0.08] hover:border-[#d4a373]/50 hover:bg-[#181e2b]/80"
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold border ${
                                            isFraud
                                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                                : "bg-[#10b981]/15 text-[#6ee7b7] border-[#34d399]/30"
                                        }`}>
                                            {isFraud ? "FRAUD" : "GENUINE"}
                                        </span>
                                        <span className={`text-[10px] font-mono font-bold ${isFraud ? "text-rose-300" : "text-[#34d399]"}`}>
                                            ${Number(sample.features.Amount).toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        Dataset Row • T={Number(sample.features.Time).toFixed(0)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-xs text-slate-500 font-mono py-2">
                        No samples available. Ensure the backend is running.
                    </div>
                )}
                <p className="text-[10px] text-slate-500 mt-2 flex items-start gap-1.5">
                    <FaInfoCircle className="text-[#d4a373] mt-0.5 flex-shrink-0" />
                    <span>Labels are from the Kaggle dataset's <code className="text-[#e2c290]">Class</code> column. All 30 features (Time + V1–V28 + Amount) are loaded. The model's prediction may differ from the dataset label.</span>
                </p>
            </div>

            {/* Quick Test Presets */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                        Quick Scenario Presets:
                    </label>
                    <span className="text-[10px] font-mono text-[#d4a373]">
                        Click to autofill vector
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {PRESETS.map((p, idx) => {
                        const Icon = p.icon;
                        const isSelected = activePreset === p.name;
                        const isFraud = p.type === "fraud";
                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => handleApplyPreset(p)}
                                className={`text-left p-3 rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-95 ${
                                    isSelected
                                        ? isFraud
                                            ? "bg-rose-500/25 border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.35)]"
                                            : "bg-[#10b981]/25 border-[#34d399] shadow-[0_0_20px_rgba(52,211,153,0.35)]"
                                        : "bg-[#121620]/60 border-white/[0.08] hover:border-[#d4a373]/50 hover:bg-[#181e2b]/80"
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <Icon className={isFraud ? "text-rose-400 text-sm" : "text-[#34d399] text-sm"} />
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border ${
                                        isFraud 
                                            ? "bg-rose-500/20 text-rose-300 border-rose-500/30" 
                                            : "bg-[#10b981]/15 text-[#6ee7b7] border-[#34d399]/30"
                                    }`}>
                                        {currency}{p.amount}
                                    </span>
                                </div>
                                <span className="text-xs font-semibold text-slate-100 line-clamp-1">
                                    {p.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 flex items-start gap-1.5">
                    <FaInfoCircle className="text-[#d4a373] mt-0.5 flex-shrink-0" />
                    <span>Scenario presets use made-up feature values for demonstration. Predictions from these are illustrative, not verified against real transaction data.</span>
                </p>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Time and Amount Row */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    {/* Time Input */}
                    <div className="sm:col-span-4">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                            Time (seconds)
                        </label>
                        <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0"
                            value={timeValue}
                            onChange={(e) => {
                                setTimeValue(e.target.value);
                                setActivePreset(null);
                                if (sampleSourceLoaded) {
                                    setVMismatchWarning(true);
                                    setSampleLabel(null);
                                    setActiveSampleIdx(null);
                                }
                            }}
                            className="poly-glass-input w-full rounded-2xl px-4 py-3 text-sm font-mono font-bold text-white placeholder-slate-500"
                            disabled={loading}
                        />
                    </div>

                    {/* Amount Input */}
                    <div className="sm:col-span-8">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                            Transaction Amount
                        </label>
                        <div className="flex gap-2.5">
                            <select
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="poly-glass-input rounded-2xl px-3 py-3 font-mono font-bold text-[#e2c290] cursor-pointer focus:ring-1 focus:ring-[#34d399] shadow-inner"
                            >
                                <option value="$" className="bg-[#0f141d] text-white">$ USD</option>
                                <option value="₹" className="bg-[#0f141d] text-white">₹ INR</option>
                                <option value="€" className="bg-[#0f141d] text-white">€ EUR</option>
                                <option value="£" className="bg-[#0f141d] text-white">£ GBP</option>
                            </select>

                            <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#d4a373] font-mono text-lg font-bold">
                                    {currency}
                                </span>
                                <input
                                    type="number"
                                    step="any"
                                    min="0"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setActivePreset(null);
                                        if (sampleSourceLoaded) {
                                            setVMismatchWarning(true);
                                            setSampleLabel(null);
                                            setActiveSampleIdx(null);
                                        }
                                    }}
                                    className="poly-glass-input w-full rounded-2xl pl-10 pr-4 py-3 text-lg font-mono font-bold text-white placeholder-slate-500"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* V-Feature Desync Warning (Phase 4 requirement) */}
                {vMismatchWarning && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-[11px] text-amber-200 flex items-start gap-2.5 shadow-sm">
                        <FaExclamationTriangle className="text-amber-400 mt-0.5 text-sm flex-shrink-0" />
                        <div className="flex-1 leading-relaxed">
                            <strong>Warning: V-features belong to a different transaction.</strong> Editing Amount or Time after loading a dataset sample desynchronizes the PCA vector from the original dataset row; the dataset label has been cleared.
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setPcaValues({});
                                setVMismatchWarning(false);
                                setSampleSourceLoaded(false);
                            }}
                            className="text-[10px] text-amber-300 underline hover:text-white font-mono cursor-pointer whitespace-nowrap self-center"
                        >
                            Reset V-Features
                        </button>
                    </div>
                )}

                {/* Currency display note */}
                <p className="text-[10px] text-slate-500 flex items-start gap-1.5 -mt-2">
                    <FaInfoCircle className="text-[#d4a373] mt-0.5 flex-shrink-0" />
                    <span>The currency symbol is for display only — the model receives the numeric amount as-is. No currency conversion is performed.</span>
                </p>

                {/* Amount-only warning */}
                {isAmountOnly && amount && (
                    <div className="p-3 rounded-xl bg-[#d4a373]/10 border border-[#d4a373]/25 text-[11px] text-[#f5eedc] flex items-start gap-2">
                        <FaInfoCircle className="text-[#e2c290] mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Amount-only mode:</strong> V1–V28 features default to zero. This is for quick demonstration only — predictions without real PCA features are not reliable for real-world fraud decisions. Use a dataset sample for verified testing.
                        </span>
                    </div>
                )}

                {/* Known Label Badge (when dataset sample is loaded) */}
                {sampleLabel !== null && (
                    <div className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
                        sampleLabel === 1
                            ? "bg-rose-500/10 border-rose-500/25 text-rose-200"
                            : "bg-[#10b981]/10 border-[#34d399]/25 text-[#a7f3d0]"
                    }`}>
                        <FaFlask className="mt-0.5 flex-shrink-0" />
                        <span>
                            <strong>Dataset label: {sampleLabel === 1 ? "Fraud (Class = 1)" : "Genuine (Class = 0)"}</strong>
                            {" — "}this is the known ground truth from the dataset. The model's prediction below may match or differ.
                        </span>
                    </div>
                )}

                {/* Advanced PCA Drawer Button */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="text-xs text-slate-400 hover:text-[#34d399] flex items-center gap-1.5 transition py-1 cursor-pointer font-medium"
                    >
                        <FaSlidersH className="text-xs text-[#d4a373]" />
                        <span>{showAdvanced ? "Collapse Advanced PCA Components (V1–V28)" : "Expand Advanced PCA Components (V1–V28)"}</span>
                        {Object.keys(pcaValues).length > 0 && (
                            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#34d399] border border-[#34d399]/30">
                                Vector Armed
                            </span>
                        )}
                    </button>

                    {showAdvanced && (
                        <div className="mt-3 p-4 rounded-2xl bg-[#0b0e14]/90 border border-white/[0.1] max-h-48 overflow-y-auto shadow-inner">
                            <div className="flex items-center justify-between mb-3 text-[11px] text-slate-400">
                                <span>PCA Transformed Dimensions (Kaggle Anonymized Features)</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPcaValues({});
                                        setVMismatchWarning(false);
                                        setSampleSourceLoaded(false);
                                    }}
                                    className="text-[#d4a373] hover:underline cursor-pointer font-medium"
                                >
                                    Reset to Baseline
                                </button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {Array.from({ length: 28 }, (_, i) => i + 1).map((num) => {
                                    const key = `V${num}`;
                                    return (
                                        <div key={key} className="flex items-center gap-1.5 bg-[#141a24]/90 px-2.5 py-1.5 rounded-xl border border-white/[0.06]">
                                            <span className="text-[10px] font-mono text-[#d4a373] w-7 font-bold">{key}:</span>
                                            <input
                                                type="number"
                                                step="any"
                                                value={pcaValues[key] !== undefined ? pcaValues[key] : ""}
                                                placeholder="0.0"
                                                onChange={(e) => handlePcaChange(key, e.target.value)}
                                                className="w-full bg-transparent text-xs font-mono text-white focus:outline-none"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Primary Polymorphic Freeze-Green Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full poly-btn-freeze font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group transition-all duration-200"
                >
                    {loading ? (
                        <>
                            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                            <span className="font-mono tracking-wider">Evaluating Transaction Matrix...</span>
                        </>
                    ) : (
                        <>
                            <span className="tracking-wide">Run AI Fraud Analysis</span>
                            <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default PredictionForm;
