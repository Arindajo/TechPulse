import { Calendar, Radio, Users, CheckCircle2, ArrowRight } from "lucide-react";

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-950 p-4 md:p-8 flex items-center justify-center font-sans">
      {/* Background Gradient Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-indigo-900/30 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full" />
      </div>

      <div className="relative max-w-sm w-full bg-white/95 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl p-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-6">
            <Radio className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">TechPulse</h1>
          <p className="text-slate-500 mt-2 text-sm">Your gateway to tech innovation</p>
        </div>

        {/* Feature List */}
        <div className="space-y-4">
          <FeatureItem icon={<Calendar className="w-5 h-5" />} title="Event Discovery" desc="Curated tech & AI events" />
          <FeatureItem icon={<Users className="w-5 h-5" />} title="Smart Interests" desc="Tailored updates for you" />
          <FeatureItem icon={<CheckCircle2 className="w-5 h-5" />} title="Instant Booking" desc="Register in seconds" />
        </div>

        {/* Action / Status Section */}
        <div className="mt-10 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</p>
              <p className="text-xs font-semibold text-slate-700 font-mono">/api/ussd-service</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase">Live</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400/60 text-[9px] mt-8 uppercase tracking-[0.2em] font-semibold">
          TechPulse Core • 2026
        </p>
      </div>
    </main>
  );
}

function FeatureItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-4 group cursor-default">
      <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}