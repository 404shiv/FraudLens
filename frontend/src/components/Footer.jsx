import { FaShieldAlt, FaPython, FaReact } from "react-icons/fa";
import { SiScikitlearn, SiFlask, SiMongodb } from "react-icons/si";

function Footer() {
    return (
        <footer className="mt-16 border-t border-white/[0.1] backdrop-blur-2xl bg-[#090d13]/85 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                
                {/* Brand & info */}
                <div>
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1.5">
                        <FaShieldAlt className="text-[#e2c290] text-sm" />
                        <h4 className="text-sm font-black text-white tracking-wide font-sans">
                            FraudLens
                        </h4>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                        High-throughput machine learning detection engine for real-time transaction scoring.
                    </p>
                </div>

                {/* Tech Stack Poly-Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-[#d4a373]/30 text-[#f5eedc] flex items-center gap-1.5 shadow-sm hover:border-[#e2c290] transition">
                        <FaPython className="text-[#e2c290]" /> Python 3.11
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-white/30 transition">
                        <SiFlask className="text-slate-200" /> Flask API
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-[#34d399]/30 text-[#6ee7b7] flex items-center gap-1.5 shadow-sm hover:border-[#34d399] transition">
                        <SiScikitlearn className="text-[#34d399]" /> Scikit-Learn
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-300 flex items-center gap-1.5 shadow-sm hover:border-white/30 transition">
                        <FaReact className="text-[#a7f3d0]" /> React 19
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-[#10b981]/30 text-[#34d399] flex items-center gap-1.5 shadow-sm hover:border-[#10b981] transition">
                        <SiMongodb className="text-[#34d399]" /> MongoDB
                    </span>
                </div>

            </div>
        </footer>
    );
}

export default Footer;