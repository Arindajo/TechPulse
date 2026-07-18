"use client";
import { useState } from 'react';
import { supabase } from '../lib/supabase/client';

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  // 1. Register/Login Step
  const handleSendOtp = async () => {
    if (phone.length < 9) return alert("Please enter a valid phone number");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ 
      phone: phone.startsWith('+') ? phone : `+256${phone.replace(/^0+/, '')}` 
    });
    setLoading(false);
    if (!error) setStep('otp');
    else alert("Error: " + error.message);
  };

  // 2. OTP Verification Step
  const handleVerifyOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({ 
      phone: phone.startsWith('+') ? phone : `+256${phone.replace(/^0+/, '')}`, 
      token: otp, 
      type: 'sms' 
    });
    setLoading(false);
    if (!error) window.location.href = '/interest';
    else alert("Invalid code. Please try again.");
  };

  return (
    <main className="min-h-screen bg-[#FEF5EB] flex flex-col items-center justify-center p-6">
      {/* Visual Header */}
      <div className="w-full max-w-sm text-center mb-8">
        <div className="w-20 h-20 bg-[#c36b05] rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-black">TP</span>
        </div>
        <h1 className="text-3xl font-black text-[#c36b05]">TechPulse</h1>
        <p className="text-slate-600 font-medium">Your gateway to innovation in Uganda</p>
      </div>

      <div className="w-full max-w-sm bg-white p-8 rounded-[2rem] shadow-xl border border-orange-100">
        {step === 'phone' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-slate-800">Enter your phone</h2>
            <input 
              type="tel" 
              placeholder="07XXXXXXXX" 
              className="w-full p-4 rounded-2xl border-2 border-orange-100 focus:border-[#c36b05] outline-none transition"
              onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={handleSendOtp} disabled={loading} className="w-full bg-[#c36b05] text-white py-4 rounded-2xl font-bold hover:bg-[#a35904] transition">
              {loading ? "Sending..." : "Get OTP Code"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <h2 className="text-xl font-bold text-slate-800">Check your SMS</h2>
            <p className="text-sm text-slate-500">We sent a 6-digit code to {phone}</p>
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000" 
              className="w-full p-4 text-center text-3xl tracking-[0.5em] rounded-2xl border-2 border-orange-100 focus:border-[#c36b05] outline-none transition"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-[#c36b05] text-white py-4 rounded-2xl font-bold hover:bg-[#a35904] transition">
              {loading ? "Verifying..." : "Verify & Join"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}