import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#080b0f] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Dynamic ambient glass glow background: Warm Beach Sand & Driftwood meets Glacial Freeze Green */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top-left: Freeze Green Frost */}
        <div className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-emerald-500/14 rounded-full blur-[130px]"></div>
        {/* Top-right: Warm Beach Sand / Amber Bronze */}
        <div className="absolute -top-20 -right-20 w-[32rem] h-[32rem] bg-amber-600/12 rounded-full blur-[140px]"></div>
        {/* Mid-center: Driftwood espresso depth */}
        <div className="absolute top-1/2 left-1/4 w-[28rem] h-[28rem] bg-[#54433a]/18 rounded-full blur-[150px]"></div>
        {/* Bottom-right: Glacial Mint Seafoam */}
        <div className="absolute -bottom-24 right-1/4 w-[34rem] h-[34rem] bg-teal-500/12 rounded-full blur-[140px]"></div>
        {/* High-contrast subtle obsidian grid line texture */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff07_1px,transparent_1px),linear-gradient(to_bottom,#ffffff07_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <Home />
      </div>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}

export default App;