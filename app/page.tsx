export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-slate-100 text-center">
        
        {/* Header Section */}
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">
          TechPulse
        </h1>
        <p className="text-slate-600 mb-6">
          The central hub for our event management system.
        </p>

        {/* API Status Section */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm font-medium text-slate-500 mb-2">
            Active API Endpoint
          </p>
          <code className="text-blue-700 font-mono bg-blue-50 px-3 py-1 rounded border border-blue-100">
            /api/sms
          </code>
        </div>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            System Status: <span className="text-green-500 font-bold">● Operational</span>
          </p>
        </div>
      </div>
    </main>
  );
}