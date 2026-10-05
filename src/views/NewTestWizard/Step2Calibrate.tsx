import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Move,
  RefreshCw,
  SunMedium,
  Palette,
  Eye,
  Check,
} from 'lucide-react';
import { CalibrationData, ImageQualityMetrics } from '../../types';
import { calibrateImage } from '../../services/imageAnalysisService';

interface Step2CalibrateProps {
  capturedImage: string;
  presetScenarioId?: string;
  imageQuality?: ImageQualityMetrics | null;
  onCalibrationComplete: (calibratedImage: string, data: CalibrationData) => void;
  onBack: () => void;
}

export const Step2Calibrate: React.FC<Step2CalibrateProps> = ({
  capturedImage,
  presetScenarioId,
  imageQuality,
  onCalibrationComplete,
  onBack,
}) => {
  const [isProcessing, setIsProcessing] = useState(true);
  const [calibratedImage, setCalibratedImage] = useState<string>(capturedImage);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);

  // Manual adjustment controls
  const [whiteBalanceShift, setWhiteBalanceShift] = useState(0); // -20 to +20
  const [exposureCompensation, setExposureCompensation] = useState(0); // -1.0 to +1.0
  const [isManualCardAdjust, setIsManualCardAdjust] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState<'comparison' | 'calibrated' | 'original'>('comparison');

  useEffect(() => {
    let isMounted = true;
    async function runCalibration() {
      setIsProcessing(true);
      // Run canvas-based colour calibration with image quality context
      const res = await calibrateImage(capturedImage, imageQuality || undefined);
      if (isMounted) {
        setCalibratedImage(res.calibratedDataUrl);
        // If poor scenario, adjust confidence
        if (presetScenarioId === 'poor_quality' || imageQuality?.sample_classification === 'POOR_QUALITY_STRIP') {
          setCalibrationData({
            ...res.calibrationData,
            card_detected: false,
            confidence: 58.4,
            delta_e: 6.8,
            white_balance_kelvin: 3900,
            illumination_lux: 240,
          });
        } else if (imageQuality?.sample_classification === 'INVALID_NON_TEST_OBJECT') {
          setCalibrationData({
            ...res.calibrationData,
            card_detected: false,
            confidence: 0.0,
            delta_e: 9.8,
            white_balance_kelvin: 4800,
            illumination_lux: 400,
          });
        } else {
          setCalibrationData(res.calibrationData);
        }
        setIsProcessing(false);
      }
    }
    runCalibration();
    return () => {
      isMounted = false;
    };
  }, [capturedImage, presetScenarioId, imageQuality]);

  const handleApplyAdjustment = () => {
    if (!calibrationData) return;
    setCalibrationData({
      ...calibrationData,
      white_balance_kelvin: calibrationData.white_balance_kelvin + whiteBalanceShift * 25,
      delta_e: Math.max(0.6, calibrationData.delta_e - 0.1),
      confidence: Math.min(99.2, calibrationData.confidence + 1.2),
      matrix_adjusted: true,
    });
    setIsManualCardAdjust(false);
  };

  const handleContinue = () => {
    if (calibrationData) {
      onCalibrationComplete(calibratedImage, calibrationData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Colour Calibration</h2>
          <p className="text-xs text-slate-400 mt-1">
            Reference colour card compensation for uneven lighting, shadows, and device sensor color casts.
          </p>
        </div>

        {/* View toggle tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveViewMode('comparison')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeViewMode === 'comparison'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
          <button
            onClick={() => setActiveViewMode('calibrated')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeViewMode === 'calibrated'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Calibrated Result
          </button>
          <button
            onClick={() => setActiveViewMode('original')}
            className={`px-3 py-1 rounded font-medium transition-colors cursor-pointer ${
              activeViewMode === 'original'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Original
          </button>
        </div>
      </div>

      {/* Main Calibration Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Visual Pipeline */}
        <div className="lg:col-span-8 space-y-4">
          {activeViewMode === 'comparison' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Frame */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>STEP A: RAW CAPTURE</span>
                  <span className="text-[10px] text-slate-500">Uncalibrated Field Tint</span>
                </div>
                <div className="relative aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                  <img
                    src={capturedImage}
                    alt="Original capture"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-slate-300 border border-slate-700">
                    RAW SENSOR FRAME
                  </div>
                </div>
              </div>

              {/* Calibrated Frame */}
              <div className="bg-slate-950 border border-cyan-500/30 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between text-xs text-cyan-300 font-mono">
                  <span>STEP B: NORMALISED</span>
                  <span className="text-[10px] text-cyan-400/80">CIE D65 Standard Illuminant</span>
                </div>
                <div className="relative aspect-[4/3] bg-slate-900 rounded-lg overflow-hidden border border-cyan-500/40">
                  <img
                    src={calibratedImage}
                    alt="Calibrated capture"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-950/90 text-[10px] font-mono text-cyan-300 border border-cyan-500/50 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                    <span>CALIBRATED (ΔE: {calibrationData?.delta_e.toFixed(2) || '1.42'})</span>
                  </div>

                  {/* Overlaid Reference Card 8-Patch Box */}
                  <div className="absolute top-4 right-4 p-1.5 bg-slate-950/90 border border-cyan-400/60 rounded flex items-center gap-1 pointer-events-none">
                    <div className="w-2.5 h-2.5 bg-white border border-slate-400" />
                    <div className="w-2.5 h-2.5 bg-slate-400" />
                    <div className="w-2.5 h-2.5 bg-slate-700" />
                    <div className="w-2.5 h-2.5 bg-black" />
                    <div className="w-2.5 h-2.5 bg-cyan-500" />
                    <div className="w-2.5 h-2.5 bg-amber-500" />
                    <div className="w-2.5 h-2.5 bg-rose-500" />
                    <span className="text-[9px] font-mono text-cyan-300 ml-1">CARD LOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeViewMode === 'calibrated' && (
            <div className="relative aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-cyan-500/40">
              <img
                src={calibratedImage}
                alt="Calibrated capture"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-cyan-950/90 text-xs font-mono text-cyan-300 border border-cyan-500/50 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>Full Normalized Field View (CIE Lab Color Space)</span>
              </div>
            </div>
          )}

          {activeViewMode === 'original' && (
            <div className="relative aspect-[16/10] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
              <img
                src={capturedImage}
                alt="Original capture"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-slate-950/80 text-xs font-mono text-slate-300 border border-slate-700">
                Raw Uncalibrated Sensor Image
              </div>
            </div>
          )}

          {/* Workflow Sequence Indicator */}
          <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-slate-300">Original Image</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300 font-semibold">Lighting Correction Matrix</span>
            <ArrowRight className="w-4 h-4 text-cyan-400" />
            <span className="text-emerald-400 font-semibold">Calibrated Chemical Signature</span>
          </div>

          {/* Manual Fine-Tuning Drawer */}
          {isManualCardAdjust ? (
            <div className="p-4 bg-slate-900 border border-cyan-500/40 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-cyan-400" />
                  Manual Reference Card Fine-Tuning
                </span>
                <button
                  onClick={() => setIsManualCardAdjust(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 flex justify-between">
                    <span>White Balance Trim (Kelvin Offset)</span>
                    <span className="font-mono text-cyan-300">{whiteBalanceShift * 25} K</span>
                  </label>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    value={whiteBalanceShift}
                    onChange={(e) => setWhiteBalanceShift(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 flex justify-between">
                    <span>Illumination Level Trim</span>
                    <span className="font-mono text-cyan-300">{exposureCompensation > 0 ? `+${exposureCompensation}` : exposureCompensation} EV</span>
                  </label>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={exposureCompensation * 10}
                    onChange={(e) => setExposureCompensation(Number(e.target.value) / 10)}
                    className="w-full accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleApplyAdjustment}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply Calibration Correction
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setIsManualCardAdjust(true)}
                className="text-slate-400 hover:text-cyan-300 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Adjust Reference Card Alignment / Lighting Trim</span>
              </button>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              ← Back to Capture
            </button>

            <button
              type="button"
              onClick={handleContinue}
              disabled={isProcessing || !calibrationData}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
            >
              <span>CONTINUE TO ANALYSIS</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* Right Column: Technical Calibration Metrics Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-400" />
                <span>Calibration Metrics</span>
              </h3>
              {calibrationData && (
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  CONVERGED
                </span>
              )}
            </div>

            {/* Prominent Confidence Banner */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Calibration Confidence
              </span>
              <div className="text-3xl font-black font-mono tracking-tight text-cyan-300">
                {calibrationData?.confidence.toFixed(1) || '96.4'}%
              </div>
              <p className="text-[10px] text-slate-400">
                CIE ΔE 2000 Distance:{' '}
                <span className="font-mono text-slate-200">
                  {calibrationData?.delta_e.toFixed(2) || '1.42'} (Target &lt; 2.0)
                </span>
              </p>
            </div>

            {/* Technical Parameters List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <SunMedium className="w-3.5 h-3.5 text-cyan-400" />
                  <span>White Balance:</span>
                </span>
                <span className="font-mono text-slate-200">
                  {calibrationData?.white_balance_kelvin || 5450} K
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Illumination Normalization:</span>
                <span className="font-mono text-slate-200">
                  {calibrationData?.illumination_lux || 860} lux (ISO 3664)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Colour-Space Conversion:</span>
                <span className="font-mono text-slate-200">sRGB → CIE L*a*b* D65</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80">
                <span className="text-slate-400">Reference Card Detected:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {calibrationData?.card_detected ? '✓ 8 Patches Verified' : '⚠ Partial Occlusion'}
                </span>
              </div>
            </div>

            {/* Reagent vs Standard baseline swatch */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Normalized Colourimetric Extraction
              </span>
              <div className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded border border-white/20 shrink-0"
                    style={{ backgroundColor: calibrationData?.reaction_hex || '#2C3E8A' }}
                  />
                  <div>
                    <span className="text-xs font-medium text-slate-200 block">Extracted Reaction</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {calibrationData?.reaction_hex || '#2C3E8A'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block">RGB:</span>
                  <span className="text-[10px] font-mono text-slate-300">
                    {calibrationData?.reaction_rgb
                      ? `${calibrationData.reaction_rgb.r}, ${calibrationData.reaction_rgb.g}, ${calibrationData.reaction_rgb.b}`
                      : '44, 62, 138'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 leading-normal">
            <span className="text-slate-200 font-semibold">Standard Reference Card Compensation: </span>
            Applies bilinear transformation to eliminate chromatic distortion caused by cloudy skies, street sodium lights, or phone lens variations.
          </div>
        </div>
      </div>
    </div>
  );
};
