import React, { useState } from 'react';
import { Shield, Check, ArrowRight } from 'lucide-react';
import {
  CalibrationData,
  DrugTest,
  ImageQualityMetrics,
  Officer,
  TestPresetScenario,
  TestResult,
} from '../../types';
import { Step1Capture } from './Step1Capture';
import { Step2Calibrate } from './Step2Calibrate';
import { Step3Analyse } from './Step3Analyse';
import { Step4Verify } from './Step4Verify';
import { Step5Evidence } from './Step5Evidence';
import { AnalysisEvaluation } from '../../services/imageAnalysisService';
import { computeSHA256, buildCanonicalEvidenceString } from '../../services/cryptoService';
import { addTestRecord } from '../../services/storageService';

interface NewTestWizardProps {
  officer: Officer;
  presetScenarioId?: string;
  onFinish: () => void;
  onGoToRepository: () => void;
}

const STEPS = [
  { step: 1, title: 'Capture' },
  { step: 2, title: 'Calibrate' },
  { step: 3, title: 'Analyse' },
  { step: 4, title: 'Verify' },
  { step: 5, title: 'Evidence' },
];

export const NewTestWizard: React.FC<NewTestWizardProps> = ({
  officer,
  presetScenarioId,
  onFinish,
  onGoToRepository,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Workflow state
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<ImageQualityMetrics | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | undefined>(presetScenarioId);

  const [calibratedImage, setCalibratedImage] = useState<string | null>(null);
  const [calibrationData, setCalibrationData] = useState<CalibrationData | null>(null);

  const [testType, setTestType] = useState<string>('Scott Reagent (Cocaine)');
  const [analysisResult, setAnalysisResult] = useState<TestResult>('POSITIVE');
  const [analysisConfidence, setAnalysisConfidence] = useState<number>(94.7);
  const [analysisEvaluation, setAnalysisEvaluation] = useState<AnalysisEvaluation | null>(null);

  const [finalTestRecord, setFinalTestRecord] = useState<DrugTest | null>(null);

  // Handlers for step progression
  const handleCaptureComplete = (
    imageData: string,
    quality: ImageQualityMetrics,
    presetId?: string
  ) => {
    setCapturedImage(imageData);
    setImageQuality(quality);
    if (presetId) setActivePresetId(presetId);
    setCurrentStep(2);
  };

  const handleCalibrationComplete = (calibrated: string, data: CalibrationData) => {
    setCalibratedImage(calibrated);
    setCalibrationData(data);
    setCurrentStep(3);
  };

  const handleAnalysisComplete = (
    result: TestResult,
    confidence: number,
    evaluation: AnalysisEvaluation
  ) => {
    setAnalysisResult(result);
    setAnalysisConfidence(confidence);
    setAnalysisEvaluation(evaluation);
    setCurrentStep(4);
  };

  const handleVerificationComplete = async (
    action: 'confirm' | 'review' | 'retake',
    notes: string,
    sampleReference: string
  ) => {
    if (action === 'retake') {
      setCurrentStep(1);
      return;
    }

    // Generate unique official Test ID
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const newTestId = `FX-2026-00${randomSeq}`;
    const timestampIso = new Date().toISOString();
    const lat = 19.0760 + (Math.random() - 0.5) * 0.04;
    const lng = 72.8777 + (Math.random() - 0.5) * 0.04;

    // Compute Cryptographic SHA-256 seal
    const canonicalString = buildCanonicalEvidenceString({
      test_id: newTestId,
      officer_id: officer.officer_id,
      test_type: testType,
      result: analysisResult,
      confidence: analysisConfidence,
      timestamp: timestampIso,
      latitude: lat,
      longitude: lng,
      device_id: 'DEV-TOUGHPAD-8812',
      image_fingerprint: capturedImage || 'IMG_NULL',
    });
    const hash = await computeSHA256(canonicalString);

    const record: DrugTest = {
      id: `rec_${Date.now()}`,
      test_id: newTestId,
      officer_id: officer.officer_id,
      officer_name: officer.name,
      test_type: testType,
      target_substance: analysisEvaluation?.substanceIdentified || 'Screening Compound',
      sample_reference: sampleReference,
      status: action === 'confirm' ? 'VERIFIED' : 'PENDING_REVIEW',
      result: analysisResult,
      confidence: analysisConfidence,
      timestamp: timestampIso,
      latitude: lat,
      longitude: lng,
      location_name: 'Field Inspection Zone 4 (Active Checkpoint)',
      device_info: {
        device_model: 'ToughPad G2 Rugged Tactical',
        os: 'Android 14 GovSecure v4.1',
        camera_sensor: 'Sony IMX766 50MP Macro',
        app_version: 'BiOrion v2.6.4-prod',
      },
      original_image_url: capturedImage || '',
      calibrated_image_url: calibratedImage || capturedImage || '',
      calibration_data: calibrationData || {
        white_balance_kelvin: 5400,
        illumination_lux: 850,
        card_detected: true,
        confidence: 96.4,
        delta_e: 1.4,
        reaction_rgb: { r: 44, g: 62, b: 138 },
        reaction_hex: '#2C3E8A',
        reference_hex: '#2B4C7E',
        matrix_adjusted: true,
      },
      evidence_hash: hash,
      integrity_verified: true,
      verification_details: {
        officer_notes: notes,
        retake_count: 0,
        field_temperature: '26.4°C',
        lighting_condition: 'Field checkpoint standard',
        signed_by: officer.name,
        signed_at: timestampIso,
      },
      audit_trail: [
        { id: `aud_${Date.now()}_1`, test_id: newTestId, actor: officer.officer_id, action: 'Field test session initialized', timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_2`, test_id: newTestId, actor: officer.officer_id, action: 'Multi-spectral macro frame captured', timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_3`, test_id: newTestId, actor: 'SYSTEM_GNSS', action: `Position fixed (${lat.toFixed(4)}, ${lng.toFixed(4)})`, timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_4`, test_id: newTestId, actor: 'BIORION_CALIBRATE', action: 'Reference card normalized', timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_5`, test_id: newTestId, actor: 'BIORION_AI', action: `Classified as ${analysisResult} (${analysisConfidence}%)`, timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_6`, test_id: newTestId, actor: officer.officer_id, action: `Attestation confirmed by ${officer.name}`, timestamp: timestampIso, status: 'SUCCESS' },
        { id: `aud_${Date.now()}_7`, test_id: newTestId, actor: 'CRYPTO_SEAL', action: `SHA-256 evidence record anchored: ${hash.slice(0, 16)}...`, timestamp: timestampIso, status: 'SUCCESS' },
      ],
      is_synced: true,
    };

    // Commit to persistent local storage
    addTestRecord(record);
    setFinalTestRecord(record);
    setCurrentStep(5);
  };

  const handleStartNewTestReset = () => {
    setCapturedImage(null);
    setImageQuality(null);
    setActivePresetId(undefined);
    setCalibratedImage(null);
    setCalibrationData(null);
    setFinalTestRecord(null);
    setCurrentStep(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Multi-Step Wizard Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {STEPS.map((s, index) => {
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;
            return (
              <React.Fragment key={s.step}>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all ${
                      isCompleted
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : isCurrent
                        ? 'bg-cyan-950 text-cyan-300 border-2 border-cyan-400 shadow-sm shadow-cyan-500/20'
                        : 'bg-slate-950 text-slate-500 border border-slate-800'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : s.step}
                  </div>
                  <span
                    className={`hidden sm:inline-block text-xs font-semibold uppercase tracking-wider ${
                      isCurrent
                        ? 'text-cyan-300'
                        : isCompleted
                        ? 'text-slate-200'
                        : 'text-slate-500'
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors ${
                      currentStep > s.step ? 'bg-cyan-500/80' : 'bg-slate-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step Renderers */}
      {currentStep === 1 && (
        <Step1Capture
          onCaptureComplete={handleCaptureComplete}
          presetScenarioId={activePresetId}
        />
      )}

      {currentStep === 2 && capturedImage && (
        <Step2Calibrate
          capturedImage={capturedImage}
          presetScenarioId={activePresetId}
          onCalibrationComplete={handleCalibrationComplete}
          onBack={() => setCurrentStep(1)}
        />
      )}

      {currentStep === 3 && calibratedImage && calibrationData && (
        <Step3Analyse
          calibratedImage={calibratedImage}
          calibrationData={calibrationData}
          testType={testType}
          presetScenarioId={activePresetId as any}
          onAnalysisComplete={handleAnalysisComplete}
          onBack={() => setCurrentStep(2)}
        />
      )}

      {currentStep === 4 && calibratedImage && analysisEvaluation && (
        <Step4Verify
          calibratedImage={calibratedImage}
          testType={testType}
          result={analysisResult}
          confidence={analysisConfidence}
          evaluation={analysisEvaluation}
          officer={officer}
          onVerificationComplete={handleVerificationComplete}
          onRetake={handleStartNewTestReset}
          onBack={() => setCurrentStep(3)}
        />
      )}

      {currentStep === 5 && finalTestRecord && (
        <Step5Evidence
          testRecord={finalTestRecord}
          onGoToRepository={onGoToRepository}
          onStartNewTest={handleStartNewTestReset}
        />
      )}
    </div>
  );
};
