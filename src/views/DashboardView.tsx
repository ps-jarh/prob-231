import React, { useState } from 'react';
import {
  Plus,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  FileCheck,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
  MapPin,
  ChevronRight,
  Clock,
  Layers,
  Activity,
  Sliders,
} from 'lucide-react';
import { DrugTest, Officer } from '../types';
import { TEST_PRESETS } from '../services/mockData';

interface DashboardViewProps {
  tests: DrugTest[];
  officer: Officer;
  onStartNewTest: (presetId?: string) => void;
  onSelectTest: (test: DrugTest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tests,
  officer,
  onStartNewTest,
  onSelectTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('ALL');

  // KPI Calculations
  const todayDatePrefix = '2026-10-05';
  const testsToday = tests.filter((t) => t.timestamp.startsWith(todayDatePrefix));
  const positiveCount = tests.filter((t) => t.result === 'POSITIVE').length;
  const negativeCount = tests.filter((t) => t.result === 'NEGATIVE').length;
  const inconclusiveCount = tests.filter((t) => t.result === 'INCONCLUSIVE').length;
  const totalEvidence = tests.length;

  // Filtered recent tests
  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.test_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.officer_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult =
      resultFilter === 'ALL' || t.result === resultFilter;

    return matchesSearch && matchesResult;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Welcome & Mission Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              OPERATIONAL FIELD DEPLOYMENT
            </span>
            <span className="text-xs text-slate-500 font-mono">STATION: {officer.station}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            BiOrion Field Screening Console
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Officer: <span className="text-slate-200 font-medium">{officer.name}</span> · Badge #{officer.badge_number}
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onStartNewTest()}
            className="w-full sm:w-auto px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ START NEW TEST</span>
          </button>
        </div>
      </div>

      {/* Quick Demo Scenarios Callout Banner (Judges & Evaluators) */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 rounded-xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Instant Demonstration Scenarios (SIH 2026 Evaluation)
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
            Click to launch pre-loaded field test strips
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEST_PRESETS.map((preset) => {
            const isPos = preset.expected_result === 'POSITIVE';
            const isNeg = preset.expected_result === 'NEGATIVE';
            return (
              <div
                key={preset.id}
                onClick={() => onStartNewTest(preset.id)}
                className="group p-3.5 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/60 rounded-lg cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {preset.name.split('—')[0]}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        isPos
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                          : isNeg
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {preset.expected_result}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400 group-hover:text-cyan-400">
                  <span>LAUNCH PIPELINE</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Tests Today</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
            {testsToday.length}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Jurisdiction Sector 4</div>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-rose-400 text-xs font-medium">
            <span>Positive</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
            {positiveCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {((positiveCount / (totalEvidence || 1)) * 100).toFixed(0)}% Detection Rate
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-medium">
            <span>Negative</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
            {negativeCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Clear Samples</div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-amber-400 text-xs font-medium">
            <span>Inconclusive</span>
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400">
            {inconclusiveCount}
          </div>
          <div className="text-[10px] font-mono text-slate-500">Field Retakes/Review</div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Evidence Records</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-cyan-300">
            {totalEvidence}
          </div>
          <div className="text-[10px] font-mono text-slate-500">100% SHA-256 Sealed</div>
        </div>
      </div>

      {/* Recent Tests Table Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Recent Field Tests</h3>
            <p className="text-xs text-slate-400">
              Live chronological chain-of-custody log from active field units. Click row to inspect digital certificate.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search Test ID, Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono w-44 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
            </div>

            {/* Segmented Result Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'].map((f) => (
                <button
                  key={f}
                  onClick={() => setResultFilter(f)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    resultFilter === f
                      ? 'bg-slate-800 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/60">
                <th className="py-2.5 px-3">Test ID</th>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Test Type</th>
                <th className="py-2.5 px-3 text-center">Result</th>
                <th className="py-2.5 px-3 text-right">Confidence</th>
                <th className="py-2.5 px-3 text-center">Evidence Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredTests.slice(0, 8).map((test) => {
                const isPos = test.result === 'POSITIVE';
                const isNeg = test.result === 'NEGATIVE';
                return (
                  <tr
                    key={test.id}
                    onClick={() => onSelectTest(test)}
                    className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                      {test.test_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400">
                      {new Date(test.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[200px] truncate">
                      {test.location_name}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono truncate max-w-[180px]">
                      {test.test_type.split('(')[0]}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                          isPos
                            ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                            : isNeg
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {test.result}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-right text-slate-200">
                      {test.confidence.toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-mono px-2 py-0.5 rounded ${
                          test.status === 'VERIFIED'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-amber-950/50 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {test.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button className="text-slate-400 group-hover:text-cyan-400 transition-colors p-1">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTests.length === 0 && (
            <div className="py-12 text-center text-slate-500 text-xs">
              No field test records match your filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
