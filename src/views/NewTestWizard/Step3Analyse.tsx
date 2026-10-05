import React, { useState, useEffect } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { CalibrationData, ImageQualityMetrics, TestResult } from '../../types';
import { AnalysisEvaluation, evaluateReaction } from '../../services/imageAnalysisService';

interface Step3AnalyseProps {
  calibratedImage: string;
  calibrationData: CalibrationData;
  testType: string;
  presetScenarioId?: 'positive' | 'negative' | 'poor_quality';
  imageQuality?: ImageQualityMetrics | null;
  onAnalysisComplete: (result: TestResult, confidence: number, evaluation: AnalysisEvaluation) => void;
  onBack: () => void;
}

const ANALYSIS_PIPELINE_STEPS = [
  'Detecting Test Region ROI',
  'Normalizing Colour Against Reference Target',
  'Comparing Reaction Signature with Library Curves',
  'Calculating Statistical Dispersion',
  'Generating Confidence Score & Verification Hash',
];

export const Step3Analyse: React.FC<Step3AnalyseProps> = ({
  calibratedImage,
  calibrationData,
  testType,
  presetScenarioId,
  imageQuality,
  onAnalysisComplete,
  onBack,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [evaluation, setEvaluation] = useState<AnalysisEvaluation | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  useEffect(() => {
    // Run simulated AI evaluation sequence with realistic micro-delays
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < ANALYSIS_PIPELINE_STEPS.length) {
        setCurrentStepIndex(step);
      } else {
        clearInterval(interval);
        const evalResult = evaluateReaction(testType, presetScenarioId, imageQuality, calibrationData);
        setEvaluation(evalResult);
        setIsAnalyzing(false);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [testType, presetScenarioId, imageQuality, calibrationData]);

  const handleProceed = () => {
    if (evaluation) {
      onAnalysisComplete(evaluation.result, evaluation.confidence, evaluation);
    }
  };

  const isPositive = evaluation?.result === 'POSITIVE';
  const isNegative = evaluation?.result === 'NEGATIVE';
  const isInconclusive = evaluation?.result === 'INCONCLUSIVE';

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">AI Test Analysis</h2>
        <p className="text-xs text-slate-400 mt-1">
          Computer vision colorimetry comparison against forensic reagent kinetic response curves.
        </p>
      </div>

      {/* Progress Animation State while Analyzing */}
      {isAnalyzing && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-cyan-950/40 flex items-center justify-center text-cyan-400">
              <BrainCircuit className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white tracking-tight">
              BiOrion Vision Engine v2.6.4
            </h3>
            <p className="text-xs font-mono text-cyan-300 mt-1">
              {ANALYSIS_PIPELINE_STEPS[currentStepIndex]}
            </p>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-2 text-left max-w-md mx-auto">
            {ANALYSIS_PIPELINE_STEPS.map((stepLabel, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2 rounded text-xs transition-all ${
                  idx < currentStepIndex
                    ? 'text-emerald-400 bg-emerald-950/20'
                    : idx === currentStepIndex
                    ? 'text-cyan-300 bg-cyan-950/30 font-medium'
                    : 'text-slate-600'
                }`}
              >
                {idx < currentStepIndex ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      idx === currentStepIndex
                        ? 'border-cyan-400 text-cyan-400 animate-spin'
                        : 'border-slate-700 text-slate-600'
                    }`}
                  >
                    •
                  </div>
                )}
                <span>{stepLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Result Display */}
      {!isAnalyzing && evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Examination & Extraction */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider">
                  Reaction Pad Region of Interest (ROI)
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Calibrated Target
                </span>
              </div>

              <div className="relative aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                <img
                  src={calibratedImage}
                  alt="Calibrated analysis view"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Overlaid Targeted Reaction Box */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-32 border-2 border-cyan-400 rounded bg-cyan-500/10 flex flex-col justify-between p-2 shadow-2xl backdrop-contrast-125">
                    <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded self-start">
                      DIAGNOSTIC ZONE LOCK
                    </span>
                    <div className="text-right">
                      <span className="text-[9px] font-mono text-cyan-200 bg-slate-950/90 px-1.5 py-0.5 rounded">
                        ΔE: {evaluation.chromaticShift.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Spectral Comparison Swatches */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded border border-white/20 shrink-0"
                    style={{ backgroundColor: evaluation.baselineHex }}
                  />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Baseline Control</span>
                    <span className="font-mono text-slate-200">{evaluation.baselineHex}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-900 border border-cyan-500/40 flex items-center gap-3">
                  <span
                    className="w-7 h-7 rounded border border-white/20 shrink-0"
                    style={{ backgroundColor: evaluation.reactionPadHex }}
                  />
                  <div>
                    <span className="text-[10px] text-cyan-400 block">Observed Reaction</span>
                    <span className="font-mono text-cyan-200 font-bold">{evaluation.reactionPadHex}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Statutory Disclaimer */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-200 font-semibold">Regulatory Notice: </span>
                This AI result is a field screening assessment and should be verified according to applicable forensic procedures. It does not replace confirmatory laboratory testing.
              </div>
            </div>
          </div>

          {/* Right Column: Large Result Card & Rationale */}
          <div className="lg:col-span-6 space-y-4">
            {/* Major Result Card */}
            <div
              className={`p-6 rounded-xl border space-y-3 ${
                isPositive
                  ? 'bg-gradient-to-b from-rose-950/40 to-slate-950 border-rose-500/60'
                  : isNegative
                  ? 'bg-gradient-to-b from-emerald-950/40 to-slate-950 border-emerald-500/60'
                  : 'bg-gradient-to-b from-amber-950/40 to-slate-950 border-amber-500/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  PRELIMINARY FIELD CLASSIFICATION
                </span>
                <span
                  className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold ${
                    isPositive
                      ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      : isNegative
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                  }`}
                >
                  AUTOMATED ASSESSMENT
                </span>
              </div>

              {/* Huge Result Typography */}
              <div
                className={`text-4xl sm:text-5xl font-black tracking-tight ${
                  isPositive
                    ? 'text-rose-400'
                    : isNegative
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {evaluation.result}
              </div>

              {/* AI Confidence & Substance */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">
                    AI Confidence:
                  </span>
                  <span className="text-lg font-black font-mono text-cyan-300">
                    {evaluation.confidence.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400">Substance Profile: </span>
                  <span className="text-slate-200 font-semibold">
                    {evaluation.substanceIdentified}
                  </span>
                </div>
              </div>
            </div>

            {/* Expandable Explanation Panel: "Why this result?" */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Why this result? (Forensic Analysis Rationale)
                  </span>
                </div>
                {showExplanation ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showExplanation && (
                <div className="p-4 pt-0 space-y-2 border-t border-slate-800/60 text-xs">
                  <ul className="space-y-2">
                    {evaluation.rationale.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                    <div>
                      <span>Chromatic Delta-E: </span>
                      <span className="text-slate-200 font-bold">
                        {evaluation.chromaticShift.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span>Threshold Margin: </span>
                      <span className="text-slate-200 font-bold">
                        {isPositive ? '+10.6 ΔE' : '-1.16 ΔE'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Forward Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                ← Back to Calibration
              </button>

              <button
                type="button"
                onClick={handleProceed}
                className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
              >
                <span>PROCEED TO OFFICER VERIFICATION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
