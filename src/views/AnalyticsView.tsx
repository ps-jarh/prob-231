import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  MapPin,
  ShieldCheck,
  AlertCircle,
  FileCheck,
  Percent,
} from 'lucide-react';
import { DrugTest } from '../types';

interface AnalyticsViewProps {
  tests: DrugTest[];
}

const RESULT_COLORS = {
  POSITIVE: '#f43f5e',
  NEGATIVE: '#10b981',
  INCONCLUSIVE: '#f59e0b',
};

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tests }) => {
  const total = tests.length || 1;
  const positiveCount = tests.filter((t) => t.result === 'POSITIVE').length;
  const negativeCount = tests.filter((t) => t.result === 'NEGATIVE').length;
  const inconclusiveCount = tests.filter((t) => t.result === 'INCONCLUSIVE').length;
  const reviewCount = tests.filter((t) => t.status === 'PENDING_REVIEW').length;
  const avgConfidence = (
    tests.reduce((acc, t) => acc + t.confidence, 0) / total
  ).toFixed(1);

  // Result Distribution Pie Data
  const pieData = [
    { name: 'Positive', value: positiveCount, color: RESULT_COLORS.POSITIVE },
    { name: 'Negative', value: negativeCount, color: RESULT_COLORS.NEGATIVE },
    { name: 'Inconclusive', value: inconclusiveCount, color: RESULT_COLORS.INCONCLUSIVE },
  ];

  // Daily Trends Data
  const dailyData = [
    { day: 'Oct 01', total: 6, positive: 2, negative: 4 },
    { day: 'Oct 02', total: 8, positive: 3, negative: 4 },
    { day: 'Oct 03', total: 5, positive: 1, negative: 3 },
    { day: 'Oct 04', total: 9, positive: 4, negative: 4 },
    { day: 'Oct 05 (Today)', total: 7, positive: 2, negative: 4 },
  ];

  // Tests by Region / Sector
  const regionData = [
    { region: 'Port Pier 3/7', tests: 9, positive: 4 },
    { region: 'Highway Barrier Alpha', tests: 7, positive: 1 },
    { region: 'Air Cargo Examination', tests: 6, positive: 2 },
    { region: 'Rail Logistics Hub', tests: 5, positive: 3 },
    { region: 'Coastal Jetty Post', tests: 4, positive: 1 },
  ];

  // Tests by Officer
  const officerData = [
    { officer: 'Insp. Vance (OFF-8492)', tests: 11, verified: 11 },
    { officer: 'Sub-Insp. Patel (OFF-7104)', tests: 6, verified: 6 },
    { officer: 'Officer Deshmukh (OFF-6391)', tests: 5, verified: 4 },
    { officer: 'Officer Sharma (OFF-8423)', tests: 4, verified: 4 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              OPERATIONAL INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-slate-400">SUPERVISOR ACCESS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Forensic Screening Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Regional trend analysis, confidence distributions, and interdiction telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
            Period: Last 7 Days (Oct 2026)
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Total Tests</span>
          <div className="text-2xl font-black font-mono text-white">{total}</div>
          <span className="text-[10px] font-mono text-slate-500">All Sectors</span>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-rose-400 block font-medium">Positive Rate</span>
          <div className="text-2xl font-black font-mono text-rose-400">
            {((positiveCount / total) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] font-mono text-slate-500">{positiveCount} Detections</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-emerald-400 block font-medium">Negative Rate</span>
          <div className="text-2xl font-black font-mono text-emerald-400">
            {((negativeCount / total) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] font-mono text-slate-500">{negativeCount} Baselines</span>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-amber-400 block font-medium">Inconclusive Rate</span>
          <div className="text-2xl font-black font-mono text-amber-400">
            {((inconclusiveCount / total) * 100).toFixed(1)}%
          </div>
          <span className="text-[10px] font-mono text-slate-500">{inconclusiveCount} Flagged</span>
        </div>

        <div className="bg-slate-900 border border-cyan-500/30 p-4 rounded-xl space-y-1">
          <span className="text-xs text-cyan-400 block font-medium">Avg Confidence</span>
          <div className="text-2xl font-black font-mono text-cyan-300">{avgConfidence}%</div>
          <span className="text-[10px] font-mono text-slate-500">CIE Normalized</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
          <span className="text-xs text-slate-400 block">Requiring Review</span>
          <div className="text-2xl font-black font-mono text-amber-300">{reviewCount}</div>
          <span className="text-[10px] font-mono text-slate-500">Supervisor Queue</span>
        </div>
      </div>

      {/* Row 1: Tests Over Time & Result Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Daily Field Test Volume
              </h3>
              <p className="text-xs text-slate-400">Tests conducted vs Positive interdictions</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500" /> Total Tests
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Positive
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="total" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={28} />
                <Bar dataKey="positive" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Result Breakdown Pie Chart */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Classification Breakdown
            </h3>
            <p className="text-xs text-slate-400">Aggregated outcome ratios</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#020617',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs font-mono">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
                <span>
                  {item.value} ({((item.value / total) * 100).toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Tests by Region & Tests by Officer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tests by Region */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Interdictions by Sector / Checkpoint
          </h3>
          <div className="space-y-3">
            {regionData.map((r) => (
              <div key={r.region} className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="font-medium">{r.region}</span>
                  <span className="font-mono text-cyan-300">
                    {r.tests} tests ({r.positive} pos)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${(r.positive / r.tests) * 100}%` }}
                  />
                  <div
                    className="bg-cyan-500 h-full"
                    style={{ width: `${((r.tests - r.positive) / r.tests) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests by Officer Activity */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Field Unit Output & Attestation
          </h3>
          <div className="space-y-3">
            {officerData.map((off) => (
              <div
                key={off.officer}
                className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200 block">{off.officer}</span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    ✓ {off.verified} Attestations Verified
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-cyan-300 text-sm">{off.tests}</span>
                  <span className="text-[10px] text-slate-500 block">Tests</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Anonymized Geographic Field Heatmap Visualizer */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Anonymized Regional Test Coordinates</span>
            </h3>
            <p className="text-xs text-slate-400">
              Coordinated GNSS field markers (privacy-preserved: no personal subject data).
            </p>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
            SECTOR 4 GRID
          </span>
        </div>

        {/* Interactive Tactical Map SVG canvas */}
        <div className="relative aspect-[21/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center p-4">
          {/* Tactical Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none" />

          {/* Plotting points from sample tests */}
          <div className="relative w-full h-full">
            {tests.slice(0, 15).map((t, idx) => {
              // Project lat/long to percent
              const x = 15 + ((t.longitude - 72.82) / 0.2) * 70;
              const y = 80 - ((t.latitude - 18.95) / 0.2) * 65;
              const isPos = t.result === 'POSITIVE';
              const isNeg = t.result === 'NEGATIVE';
              return (
                <div
                  key={t.id}
                  style={{ left: `${Math.min(92, Math.max(8, x))}%`, top: `${Math.min(88, Math.max(10, y))}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 transition-transform group-hover:scale-150 ${
                      isPos
                        ? 'bg-rose-500/80 border-rose-300 animate-pulse'
                        : isNeg
                        ? 'bg-emerald-500/80 border-emerald-300'
                        : 'bg-amber-500/80 border-amber-300'
                    }`}
                  />
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 whitespace-nowrap bg-slate-900 border border-slate-700 text-white text-[10px] font-mono px-2 py-1 rounded shadow-xl">
                    <div className="font-bold text-cyan-300">{t.test_id}</div>
                    <div>{t.location_name}</div>
                    <div className={isPos ? 'text-rose-400' : isNeg ? 'text-emerald-400' : 'text-amber-400'}>
                      {t.result} ({t.confidence}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-slate-800 p-2 rounded text-[10px] font-mono text-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Positive Interdiction
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Negative Screening
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged / Inconclusive
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
