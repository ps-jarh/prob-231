import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  FileCheck,
  ArrowRight,
  ClipboardCheck,
} from 'lucide-react';
import { CalibrationData, EvidenceStatus, Officer, TestResult } from '../../types';
import { AnalysisEvaluation } from '../../services/imageAnalysisService';

interface Step4VerifyProps {
  calibratedImage: string;
  testType: string;
  result: TestResult;
  confidence: number;
  evaluation: AnalysisEvaluation;
  officer: Officer;
  onVerificationComplete: (
    action: 'confirm' | 'review' | 'retake',
    notes: string,
    sampleReference: string
  ) => void;
  onRetake: () => void;
  onBack: () => void;
}

export const Step4Verify: React.FC<Step4VerifyProps> = ({
  calibratedImage,
  testType,
  result,
  confidence,
  evaluation,
  officer,
  onVerificationComplete,
  onRetake,
  onBack,
}) => {
  const [selectedAction, setSelectedAction] = useState<'confirm' | 'review'>('confirm');
  const [sampleReference, setSampleReference] = useState(`SEIZE-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [officerNotes, setOfficerNotes] = useState(
    result === 'POSITIVE'
      ? 'Field screening test positive for target narcotic compound. Rapid colorimetric reaction verified under standard reference illumination.'
      : result === 'NEGATIVE'
      ? 'Negative baseline reaction confirmed against reference standard. No detectable chromophore shift.'
      : 'Ambiguous optical reaction observed. Marked for supervisor review and second confirmatory strip.'
  );
  const [hasConfirmedEvidence, setHasConfirmedEvidence] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedEvidence) return;
    onVerificationComplete(selectedAction, officerNotes, sampleReference);
  };

  const isPositive = result === 'POSITIVE';
  const isNegative = result === 'NEGATIVE';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Officer Verification</h2>
        <p className="text-xs text-slate-400 mt-1">
          Review computer-vision assessment, attest to field chain-of-custody, and authorize digital evidence generation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Side-by-Side: Captured Evidence + AI Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Captured Evidence */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Captured Evidence</span>
              </span>
              <span className="font-mono text-[10px] text-cyan-300">CALIBRATED</span>
            </div>

            <div className="relative aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
              <img
                src={calibratedImage}
                alt="Captured evidence"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-300">
                Test Kit: {testType}
              </div>
            </div>

            <div className="text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Attesting Officer:</span>
                <span className="font-mono text-slate-200">{officer.name} ({officer.officer_id})</span>
              </div>
              <div className="flex justify-between">
                <span>Station:</span>
                <span className="text-slate-200">{officer.station}</span>
              </div>
            </div>
          </div>

          {/* Right: AI Analysis Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>AI Analysis Summary</span>
              </span>
              <span className="font-mono text-[10px] text-slate-400">DECISION SUPPORT</span>
            </div>

            <div
              className={`p-4 rounded-lg border flex items-center justify-between ${
                isPositive
                  ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                  : isNegative
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Classified Assessment
                </span>
                <span className="text-2xl font-black">{result}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Confidence</span>
                <span className="text-xl font-bold font-mono">{confidence.toFixed(1)}%</span>
              </div>
            </div>

            {/* Decision Selectors */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-300">
                Select Field Action:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedAction('confirm')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    selectedAction === 'confirm'
                      ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Confirm Result</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Accept assessment and commit to evidence registry.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedAction('review')}
                  className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    selectedAction === 'review'
                      ? 'bg-amber-950/50 border-amber-400 text-amber-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Mark for Review</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Flag for secondary supervisor verification.
                  </p>
                </button>
              </div>
            </div>

            {/* Retake Option */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={onRetake}
                className="text-xs text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Discard & Retake Test From Step 1</span>
              </button>
            </div>
          </div>
        </div>

        {/* Evidence Metadata Inputs */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-cyan-400" />
            <span>Case Reference & Chain-of-Custody Attestation</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Sample Evidence Tag / Bag Reference
              </label>
              <input
                type="text"
                value={sampleReference}
                onChange={(e) => setSampleReference(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                placeholder="e.g. SEIZE-2026-0912"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Field Environmental Conditions
              </label>
              <input
                type="text"
                readOnly
                value="26.4°C · 65% RH · Ambient Daylight Diffuse"
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Officer Notes & Observations
            </label>
            <textarea
              rows={2}
              value={officerNotes}
              onChange={(e) => setOfficerNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              placeholder="Record packaging condition, suspect statements, or observed anomalies..."
              required
            />
          </div>

          {/* Mandatory Legal Affirmation Checkbox */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasConfirmedEvidence}
                onChange={(e) => setHasConfirmedEvidence(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-500 accent-cyan-400 cursor-pointer"
              />
              <span className="text-xs text-slate-300 group-hover:text-white leading-relaxed select-none">
                <span className="font-semibold text-white">Legal Attestation: </span>
                I confirm that the captured evidence corresponds directly to this field test and that standard physical chain-of-custody protocols were maintained during sampling.
              </span>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            ← Back to Analysis
          </button>

          <button
            type="submit"
            disabled={!hasConfirmedEvidence}
            className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
          >
            <span>FINALIZE EVIDENCE RECORD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
