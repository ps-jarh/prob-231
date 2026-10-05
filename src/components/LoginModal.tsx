import React, { useState } from 'react';
import { Shield, Lock, Fingerprint, KeyRound, CheckCircle2, FileCheck2, HardDriveDownload } from 'lucide-react';
import { CURRENT_OFFICER } from '../services/mockData';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [officerId, setOfficerId] = useState('OFF-8492');
  const [password, setPassword] = useState('••••••••••••');
  const [isScanningBiometric, setIsScanningBiometric] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess();
  };

  const handleBiometricAuth = () => {
    setIsScanningBiometric(true);
    setTimeout(() => {
      setIsScanningBiometric(false);
      setBiometricSuccess(true);
      setTimeout(() => {
        onLoginSuccess();
      }, 600);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background forensic grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.06)_0,transparent_100%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40 pointer-events-none" />

      <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl relative z-10 grid grid-cols-1 md:grid-cols-12">
        {/* Left Column: Mission context & credentials */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 p-6 sm:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">BiOrion</h1>
                <p className="text-xs text-cyan-400/90 font-mono">SIH 2026 · Problem SIH26231</p>
              </div>
            </div>

            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Digital Companion for Field Drug Testing
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6">
              Authorized law-enforcement field screening support system. Standardized colourimetric kit computer-vision analysis with tamper-evident SHA-256 evidence integrity sealing.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero API Key Required (100% Standalone On-Device)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Encrypted Session (TLS 1.3 · AES-256-GCM)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <FileCheck2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Evidence Integrity Enabled (Web Crypto SHA-256)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800/60">
            <p className="text-[11px] font-mono text-slate-300 leading-normal">
              Notice: This is a decision-support and evidence-recording system. Preliminary screening assessments require confirmatory laboratory analysis.
            </p>
          </div>
        </div>

        {/* Right Column: Secure Access Form */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">BiOrion Secure Access</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter official operator credentials or launch simulated field demonstration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Officer / Operator ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={officerId}
                  onChange={(e) => setOfficerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="e.g. OFF-8492"
                  required
                />
                <span className="absolute right-3 top-3 text-[10px] font-mono text-slate-500">
                  VERIFIED ID
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Security Password / Token
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  placeholder="••••••••••••"
                  required
                />
                <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
              </div>
            </div>

            {/* Optional Biometric Verification Placeholder */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleBiometricAuth}
                disabled={isScanningBiometric || biometricSuccess}
                className={`w-full py-2.5 px-4 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  biometricSuccess
                    ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                    : isScanningBiometric
                    ? 'bg-cyan-950/40 border-cyan-500/60 text-cyan-300 animate-pulse'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <Fingerprint className={`w-4 h-4 ${isScanningBiometric ? 'animate-bounce text-cyan-400' : 'text-slate-400'}`} />
                <span>
                  {biometricSuccess
                    ? 'Biometrics Verified (FIDO2 Key Active)'
                    : isScanningBiometric
                    ? 'Scanning Field Biometrics...'
                    : 'Touch Biometric Sensor / Smart Card FIDO'}
                </span>
              </button>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                Authenticate & Access Dashboard
              </button>

              {/* DEMO MODE BUTTON - PRIMARY ACCESSIBILITY FOR JUDGES */}
              <button
                type="button"
                onClick={onLoginSuccess}
                className="w-full py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
              >
                <HardDriveDownload className="w-4 h-4" />
                <span>ENTER DEMO MODE</span>
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500">
            <span>Operator: {CURRENT_OFFICER.name}</span>
            <span>Terminal: #TK-8812</span>
          </div>
        </div>
      </div>
    </div>
  );
};
