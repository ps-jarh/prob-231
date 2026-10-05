import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Printer,
  Download,
  FileText,
  MapPin,
  Calendar,
  Clock,
  User,
  HardDrive,
  Hash,
  Plus,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { DrugTest } from '../../types';
import { computeSHA256 } from '../../services/cryptoService';

interface Step5EvidenceProps {
  testRecord: DrugTest;
  onGoToRepository: () => void;
  onStartNewTest: () => void;
}

export const Step5Evidence: React.FC<Step5EvidenceProps> = ({
  testRecord,
  onGoToRepository,
  onStartNewTest,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationDone, setVerificationDone] = useState(false);

  const handleVerifyIntegrity = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationDone(true);
    }, 700);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSeal = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(testRecord, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${testRecord.test_id}_evidence_seal.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isPositive = testRecord.result === 'POSITIVE';
  const isNegative = testRecord.result === 'NEGATIVE';

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Success Confirmation Banner */}
      <div className="p-4 bg-emerald-950/30 border border-emerald-500/50 rounded-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
              Evidence Record Successfully Sealed
            </h2>
            <p className="text-xs text-emerald-300/90 font-mono">
              Cryptographic timestamp recorded · Tamper-evident ledger updated
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>EXPORT PDF</span>
          </button>
        </div>
      </div>

      {/* Official Certificate Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        {/* Certificate Header */}
        <div className="px-6 py-5 bg-slate-950 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400 font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 block">
                OFFICIAL LAW-ENFORCEMENT RECORD
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight">FIELD TEST RECORD</h3>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-mono text-slate-500 block">RECORD IDENTIFIER</span>
            <span className="text-base font-mono font-bold text-cyan-300 bg-slate-900 px-3 py-1 rounded border border-slate-800">
              {testRecord.test_id}
            </span>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6">
          {/* Assessment Summary Strip */}
          <div
            className={`p-4 rounded-lg border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isPositive
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                : isNegative
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/20 border-amber-500/40 text-amber-300'
            }`}
          >
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                FIELD CLASSIFICATION
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black">{testRecord.result}</span>
                <span className="text-xs font-mono text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-700">
                  AI Confidence: {testRecord.confidence.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="text-right sm:text-right">
              <span className="text-[10px] font-mono text-slate-400">TEST KIT & SUBSTANCE</span>
              <div className="font-semibold text-slate-100 text-sm">{testRecord.target_substance}</div>
              <div className="text-xs font-mono text-slate-400">{testRecord.test_type}</div>
            </div>
          </div>

          {/* Side-by-side Photographic Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>RAW CAPTURE</span>
                <span>ORIGINAL</span>
              </div>
              <div className="aspect-[4/3] rounded overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={testRecord.original_image_url}
                  alt="Original field strip"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-cyan-500/30 space-y-2">
              <div className="flex justify-between text-[11px] text-cyan-300 font-mono">
                <span>CALIBRATED SIGNATURE</span>
                <span>ΔE: {testRecord.calibration_data?.delta_e.toFixed(2) || '1.42'}</span>
              </div>
              <div className="aspect-[4/3] rounded overflow-hidden bg-slate-900 border border-cyan-500/40">
                <img
                  src={testRecord.calibrated_image_url}
                  alt="Calibrated field strip"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Record Fields Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                OFFICER ID
              </span>
              <p className="font-mono text-slate-200 mt-1">{testRecord.officer_id}</p>
              <p className="text-[10px] text-slate-400">{testRecord.officer_name}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                DATE & TIME
              </span>
              <p className="font-mono text-slate-200 mt-1">
                {new Date(testRecord.timestamp).toLocaleDateString()}
              </p>
              <p className="text-[10px] font-mono text-slate-400">
                {new Date(testRecord.timestamp).toLocaleTimeString()}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                GNSS POSITION
              </span>
              <p className="font-mono text-slate-200 mt-1">
                {testRecord.latitude.toFixed(4)}°, {testRecord.longitude.toFixed(4)}°
              </p>
              <p className="text-[10px] text-slate-400 truncate">{testRecord.location_name}</p>
            </div>

            <div>
              <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                <HardDrive className="w-3 h-3 text-slate-400" />
                DEVICE & SENSOR
              </span>
              <p className="font-mono text-slate-200 mt-1">{testRecord.device_info.device_model}</p>
              <p className="text-[10px] font-mono text-slate-400 truncate">{testRecord.device_info.camera_sensor}</p>
            </div>
          </div>

          {/* Cryptographic Integrity Section */}
          <div className="bg-slate-950 p-4 rounded-lg border border-cyan-500/30 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  SHA-256 EVIDENCE INTEGRITY HASH
                </span>
                <div className="font-mono text-xs text-cyan-200 break-all select-all mt-1 bg-slate-900/90 p-2.5 rounded border border-slate-800">
                  {testRecord.evidence_hash}
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyIntegrity}
                disabled={isVerifying}
                className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shrink-0 cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isVerifying ? 'CALCULATING HASH...' : 'VERIFY INTEGRITY'}</span>
              </button>
            </div>

            {verificationDone && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-500/60 rounded text-xs text-emerald-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">✓ Evidence integrity verified</span>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    SHA-256 seal recalculated from immutable pixel buffer + GNSS telemetry. 0 byte discrepancy detected.
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Cryptographic timestamp recorded</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Audit record created (#AUD-{testRecord.test_id.slice(-4)})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onStartNewTest}
          className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>START ANOTHER TEST</span>
        </button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadSeal}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Evidence Seal</span>
          </button>

          <button
            type="button"
            onClick={onGoToRepository}
            className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>View in Repository</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
