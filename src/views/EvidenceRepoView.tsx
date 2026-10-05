import React, { useState } from 'react';
import {
  Search,
  Filter,
  FileText,
  Download,
  ShieldCheck,
  ChevronRight,
  MapPin,
  Calendar,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';
import { DrugTest } from '../types';

interface EvidenceRepoViewProps {
  tests: DrugTest[];
  onSelectTest: (test: DrugTest) => void;
  onStartNewTest: () => void;
}

export const EvidenceRepoView: React.FC<EvidenceRepoViewProps> = ({
  tests,
  onSelectTest,
  onStartNewTest,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [resultFilter, setResultFilter] = useState('ALL');

  const filteredTests = tests.filter((t) => {
    const matchesSearch =
      t.test_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.officer_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.location_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.test_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.evidence_hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || t.status === statusFilter;

    const matchesResult =
      resultFilter === 'ALL' || t.result === resultFilter;

    return matchesSearch && matchesStatus && matchesResult;
  });

  const exportAllCsv = () => {
    const headers = ['Test ID', 'Date', 'Officer ID', 'Type', 'Result', 'Confidence', 'Status', 'Hash'];
    const rows = filteredTests.map((t) => [
      t.test_id,
      t.timestamp,
      t.officer_id,
      `"${t.test_type}"`,
      t.result,
      t.confidence,
      t.status,
      t.evidence_hash,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `biorion_evidence_manifest_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              TAMPER-EVIDENT REPOSITORY
            </span>
            <span className="text-xs font-mono text-slate-400">
              {filteredTests.length} RECORDS INDEXED
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Evidence Records Management
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically sealed and audited colourimetric drug test determinations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAllCsv}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Manifest (CSV)</span>
          </button>

          <button
            onClick={onStartNewTest}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            + New Test
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder="Search by Test ID, Officer ID, Hash, Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Result Filter Tabs */}
          <div className="md:col-span-6 flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'].map((res) => (
                <button
                  key={res}
                  onClick={() => setResultFilter(res)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    resultFilter === res
                      ? 'bg-slate-800 text-cyan-300 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              {['ALL', 'VERIFIED', 'PENDING_REVIEW'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {st === 'PENDING_REVIEW' ? 'Review' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/80">
                <th className="py-3 px-4">Test ID</th>
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3">Officer</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Reagent Strip</th>
                <th className="py-3 px-3 text-center">Result</th>
                <th className="py-3 px-3 text-right">Confidence</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredTests.map((test) => {
                const isPos = test.result === 'POSITIVE';
                const isNeg = test.result === 'NEGATIVE';
                return (
                  <tr
                    key={test.id}
                    onClick={() => onSelectTest(test)}
                    className="hover:bg-slate-850/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300 group-hover:text-cyan-200">
                      {test.test_id}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(test.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300 whitespace-nowrap">
                      {test.officer_id}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">
                      {test.location_name}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono truncate max-w-[170px]">
                      {test.test_type}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded ${
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
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 max-w-[130px] truncate">
                      {test.evidence_hash}
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
                      <span className="text-cyan-400 group-hover:text-cyan-300 font-medium inline-flex items-center gap-1 text-[11px]">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredTests.length === 0 && (
            <div className="py-16 text-center text-slate-500 text-xs">
              No evidence records found matching the query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
