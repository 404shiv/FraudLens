import { FaShieldAlt, FaCreditCard, FaBrain } from "react-icons/fa";

function Navbar() {
    return (
        <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#0a0e14]/80 border-b border-white/[0.12] shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                
                {/* Brand & Logo */}
                <div className="flex items-center gap-3.5">
                    {/* Beach Sand & Bronze Poly-Glass Badge */}
                    <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#e2c290] via-[#c89666] to-[#54433a] p-[1.5px] shadow-[0_4px_20px_rgba(212,163,115,0.35)]">
                        <div className="w-full h-full bg-[#12161f] rounded-2xl flex items-center justify-center border border-white/20">
                            <FaShieldAlt className="text-[#e2c290] text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0d121a] border border-[#34d399]/60 flex items-center justify-center shadow-sm">
                                <FaCreditCard className="text-[#34d399] text-[9px]" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                                <span>FRAUD</span>
                                <span className="bg-gradient-to-r from-[#e2c290] via-[#f5e6d3] to-[#34d399] bg-clip-text text-transparent">
                                    LENS
                                </span>
                            </h1>
                            <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-full bg-gradient-to-r from-[#d4a373]/20 to-[#34d399]/20 text-[#f5eedc] border border-white/15 shadow-sm">
                                Random Forest ML
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                            Demo ML Scoring Engine • Random Forest & SMOTE Architecture
                        </p>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-2.5">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 font-mono shadow-inner">
                        <FaBrain className="text-[#e2c290] text-xs" />
                        <span>Random Forest Classifier</span>
                    </div>

                    {/* Glacial Freeze Green Crystal Capsule */}
                    <div className="poly-btn-freeze px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.35)] cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-80"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        <span className="text-white text-[11px] font-mono tracking-widest">
                            SYSTEM ONLINE
                        </span>
                    </div>
                </div>

            </div>
        </header>
    );
}

export default Navbar;