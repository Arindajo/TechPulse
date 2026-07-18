"use client";
import { useState } from 'react';
import { getSupabase } from '../lib/supabase/client';

export default function AuthPage() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  
  const supabase = getSupabase();

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
    <main className="app-shell-centered">
      <div className="app-container-narrow stack-md">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#9dff7e] rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#9dff7e]/20">
          <span className="text-[#0d2c1a] text-3xl font-black">TP</span>
        </div>
        <h1 className="section-title text-3xl">TechPulse</h1>
        <p className="section-subtitle font-medium">Your gateway to innovation in Uganda</p>
      </div>

      <div className="glass-panel panel-pad-lg stack-md">
        {step === 'phone' ? (
          <div className="stack-sm">
            <h2 className="text-xl font-bold text-[#effff6]">Enter your phone</h2>
            <input 
              type="tel" 
              placeholder="07XXXXXXXX" 
              className="tp-input"
              onChange={(e) => setPhone(e.target.value)}
            />
            <button onClick={handleSendOtp} disabled={loading} className="tp-btn-primary w-full">
              {loading ? "Sending..." : "Get OTP Code"}
            </button>
          </div>
        ) : (
          <div className="stack-sm">
            <h2 className="text-xl font-bold text-[#effff6]">Check your SMS</h2>
            <p className="text-sm tp-muted">We sent a 6-digit code to {phone}</p>
            <input 
              type="text" 
              maxLength={6}
              placeholder="000000" 
              className="tp-input text-center text-3xl tracking-[0.5em]"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button onClick={handleVerifyOtp} disabled={loading} className="tp-btn-primary w-full">
              {loading ? "Verifying..." : "Verify & Join"}
            </button>
          </div>
        )}
      </div>
      </div>
    </main>
  );
}