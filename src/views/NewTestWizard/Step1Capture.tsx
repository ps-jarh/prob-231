import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Maximize2,
  SlidersHorizontal,
} from 'lucide-react';
import { ImageQualityMetrics, TestPresetScenario } from '../../types';
import { TEST_PRESETS } from '../../services/mockData';
import { assessImageQuality } from '../../services/imageAnalysisService';

interface Step1CaptureProps {
  onCaptureComplete: (imageData: string, quality: ImageQualityMetrics, presetId?: string) => void;
  presetScenarioId?: string;
}

export const Step1Capture: React.FC<Step1CaptureProps> = ({
  onCaptureComplete,
  presetScenarioId,
}) => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isAnalyzingQuality, setIsAnalyzingQuality] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<ImageQualityMetrics | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 19.0760,
    lng: 72.8777,
  });
  const [captureTime, setCaptureTime] = useState<string>('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(presetScenarioId || null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If a preset was requested (e.g. from Dashboard quick scenario card)
  useEffect(() => {
    if (presetScenarioId) {
      const preset = TEST_PRESETS.find((p) => p.id === presetScenarioId);
      if (preset) {
        handleSelectPreset(preset);
      }
    }
  }, [presetScenarioId]);

  // Request actual geolocation if supported
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {
          // fallback to standard checkpoint coordinates
          setGpsLocation({ lat: 19.0760, lng: 72.8777 });
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError('Camera stream unavailable. Please use image upload or select a preset field scenario.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const takeSnapshot = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    processCapturedImage(dataUrl, false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        processCapturedImage(dataUrl, false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectPreset = async (preset: TestPresetScenario) => {
    stopCamera();
    setSelectedPresetId(preset.id);
    setCapturedImage(preset.image_url);
    setCaptureTime(new Date().toLocaleTimeString());
    setIsAnalyzingQuality(true);
    
    // Assess quality or use preset metrics
    const quality = await assessImageQuality(preset.image_url, preset.id === 'poor_quality');
    setIsAnalyzingQuality(false);
    setQualityMetrics(quality);
  };

  const processCapturedImage = async (dataUrl: string, isForcedPoor: boolean) => {
    setCapturedImage(dataUrl);
    setCaptureTime(new Date().toLocaleTimeString());
    setIsAnalyzingQuality(true);
    const quality = await assessImageQuality(dataUrl, isForcedPoor);
    setIsAnalyzingQuality(false);
    setQualityMetrics(quality);
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setQualityMetrics(null);
    setSelectedPresetId(null);
    stopCamera();
  };

  const handleProceed = () => {
    if (capturedImage && qualityMetrics) {
      onCaptureComplete(capturedImage, qualityMetrics, selectedPresetId || undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Guidelines */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">Capture Test Evidence</h2>
        <p className="text-xs text-slate-400 mt-1">
          Capture or upload photograph of the chemical test strip alongside the standardized reference colour card.
        </p>
      </div>

      {/* Visual Instruction Banner */}
      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg flex items-start gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-white">Capture Protocol: </span>
          Position the test strip inside the guide frame and ensure the reference colour card is visible. Maintain even, non-glare illumination at 15–20cm working distance.
        </div>
      </div>

      {/* Presets Quick Selector for Demonstration */}
      <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Rapid Field Scenarios (SIH Evaluation Presets)
          </span>
          <span className="text-[10px] text-slate-500 font-mono">1-CLICK DEMO</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {TEST_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`p-2.5 rounded text-left border transition-all text-xs cursor-pointer ${
                selectedPresetId === preset.id
                  ? 'bg-cyan-950/40 border-cyan-500/60 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs flex items-center justify-between">
                <span>{preset.name.split('—')[0]}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    preset.expected_result === 'POSITIVE'
                      ? 'bg-rose-950 text-rose-300'
                      : preset.expected_result === 'NEGATIVE'
                      ? 'bg-emerald-950 text-emerald-300'
                      : 'bg-amber-950 text-amber-300'
                  }`}
                >
                  {preset.expected_result}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-1">{preset.subtitle}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Capture Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Viewport / Camera / Upload */}
        <div className="lg:col-span-8 space-y-4">
          {!capturedImage && !isCameraActive && (
            <div className="aspect-[4/3] bg-slate-950 border-2 border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-4">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">Select Capture Method</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Use device camera for real-time field capture or upload an image file from local storage.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>OPEN CAMERA</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer border border-slate-700"
                >
                  <Upload className="w-4 h-4" />
                  <span>UPLOAD IMAGE</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {cameraError && (
                <div className="mt-4 p-2.5 bg-amber-950/40 border border-amber-500/40 rounded text-xs text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}
            </div>
          )}

          {/* Active Live Camera Stream with Guided Overlay */}
          {isCameraActive && (
            <div className="relative aspect-[4/3] bg-black rounded-xl overflow-hidden border border-slate-700">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Forensic Guided Alignment Frame */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
                {/* Reference Card Target Box */}
                <div className="w-3/4 h-2/3 border-2 border-dashed border-cyan-400/80 rounded-lg relative flex flex-col justify-between p-3">
                  {/* Corner crosshairs */}
                  <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                  <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                  <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400" />

                  <div className="flex justify-between items-start">
                    <span className="bg-slate-950/80 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded border border-cyan-500/40">
                      REFERENCE CARD TARGET
                    </span>
                    <span className="bg-slate-950/80 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/40">
                      REAGENT PAD ROI
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="text-[11px] font-mono text-cyan-200/90 bg-slate-950/70 px-2 py-1 rounded">
                      [ ALIGN TEST STRIP HERE ]
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom camera controls */}
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-20">
                <button
                  type="button"
                  onClick={stopCamera}
                  className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={takeSnapshot}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/30 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>CAPTURE FRAME</span>
                </button>
              </div>
            </div>
          )}

          {/* Captured Image Preview with Overlays */}
          {capturedImage && (
            <div className="space-y-3">
              <div className="relative aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                <img
                  src={capturedImage}
                  alt="Captured drug test strip"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />

                {/* Simulated ROI Detection Overlays */}
                <div className="absolute top-4 left-4 p-2 bg-slate-950/80 backdrop-blur-sm border border-slate-700 rounded text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span>FRAME LOCKED</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Res: 1920×1440 · RGB24
                  </div>
                </div>

                {/* Overlaid Detected Regions */}
                <div className="absolute top-1/4 right-1/4 w-32 h-20 border-2 border-cyan-400/90 rounded bg-cyan-500/10 pointer-events-none flex items-start p-1">
                  <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-1 rounded">
                    REF_CARD
                  </span>
                </div>
                <div className="absolute bottom-1/3 left-1/3 w-28 h-16 border-2 border-amber-400/90 rounded bg-amber-500/10 pointer-events-none flex items-start p-1">
                  <span className="text-[9px] font-mono text-amber-300 bg-slate-950/80 px-1 rounded">
                    TEST_STRIP_PAD
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake / Change Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceed}
                  disabled={isAnalyzingQuality || !qualityMetrics}
                  className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-md shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                >
                  <span>CONTINUE TO CALIBRATION</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pre-Flight Image Quality Assessment & Telemetry */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <span>Image Quality Assessment</span>
            </h3>

            {isAnalyzingQuality && (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Running OpenCV quality checks...</p>
              </div>
            )}

            {!capturedImage && !isAnalyzingQuality && (
              <p className="text-xs text-slate-500 py-6 text-center">
                Capture an image or select a preset scenario to evaluate sharpness, exposure, and fiducial card detection.
              </p>
            )}

            {capturedImage && qualityMetrics && !isAnalyzingQuality && (
              <div className="space-y-3">
                {/* Quality Metrics Bars */}
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Sharpness / Focus</span>
                      <span className="font-mono text-cyan-300">{qualityMetrics.blur_score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          qualityMetrics.blur_score > 60 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${qualityMetrics.blur_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Exposure Balance</span>
                      <span className="font-mono text-cyan-300">{qualityMetrics.exposure_score}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          qualityMetrics.exposure_score > 55 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${qualityMetrics.exposure_score}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-300 mb-1">
                      <span>Lighting Uniformity</span>
                      <span className="font-mono text-cyan-300">{qualityMetrics.lighting_uniformity}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          qualityMetrics.lighting_uniformity > 60 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${qualityMetrics.lighting_uniformity}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Checkpoints list */}
                <div className="pt-2 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Reference card detected</span>
                    {qualityMetrics.reference_card_detected ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>DETECTED</span>
                      </span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-mono text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>NOT FOUND</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Test strip pad detected</span>
                    {qualityMetrics.test_strip_detected ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>LOCKED</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1 font-mono text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>AMBIGUOUS</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Overall Verdict Banner */}
                {qualityMetrics.overall_acceptable ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/50 rounded flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>✓ Image quality acceptable for calibration</span>
                  </div>
                ) : (
                  <div className="p-2.5 bg-amber-950/40 border border-amber-500/50 rounded text-xs text-amber-300 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-amber-200">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Retake Recommended</span>
                    </div>
                    <ul className="text-[11px] list-disc list-inside text-amber-300/90 pl-1 space-y-0.5">
                      {qualityMetrics.warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Environmental Telemetry Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-xs space-y-2.5">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
              Field Telemetry Lock
            </h4>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                <span>GPS Location:</span>
              </span>
              <span className="font-mono text-slate-200">
                {gpsLocation ? `${gpsLocation.lat.toFixed(4)}° N, ${gpsLocation.lng.toFixed(4)}° E` : 'Acquiring GNSS...'}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Capture Time:</span>
              </span>
              <span className="font-mono text-slate-200">{captureTime || 'Waiting capture'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Device Sensor:</span>
              <span className="font-mono text-slate-200">Sony IMX766 50MP Macro</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
