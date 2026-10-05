import React, { useState } from 'react';
import {
  Clock,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Download,
  Terminal,
  Hash,
} from 'lucide-react';
import { AuditEvent } from '../types';

interface AuditLogViewProps {
  events: AuditEvent[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ events }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actorFilter, setActorFilter] = useState('ALL');

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.test_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesActor =
      actorFilter === 'ALL' ||
      (actorFilter === 'OFFICER' && evt.actor.startsWith('OFF-')) ||
      (actorFilter === 'SYSTEM' && !evt.actor.startsWith('OFF-'));

    return matchesSearch && matchesActor;
  });

  const exportAuditLog = () => {
    const headers = ['Event ID', 'Timestamp', 'Test ID', 'Actor', 'Action', 'Status'];
    const rows = filteredEvents.map((e) => [
      e.id,
      e.timestamp,
      e.test_id,
      e.actor,
      `"${e.action}"`,
      e.status,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', `biorion_audit_trail_${Date.now()}.csv`);
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
              IMMUTABLE CHRONOLOGY
            </span>
            <span className="text-xs font-mono text-slate-400">
              {filteredEvents.length} VERIFIED TRANSACTIONS
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            Tamper-Evident Audit Trail
          </h1>
          <p className="text-xs text-slate-400">
            Chronological forensic event journal. Every action is cryptographically signed and sequenced.
          </p>
        </div>

        <button
          onClick={exportAuditLog}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-slate-400" />
          <span>Export Audit Log (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search event, actor, test ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs self-start sm:self-auto">
            {['ALL', 'OFFICER', 'SYSTEM'].map((act) => (
              <button
                key={act}
                onClick={() => setActorFilter(act)}
                className={`px-3 py-1 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  actorFilter === act
                    ? 'bg-slate-800 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {act}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vertical Timeline Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="relative border-l-2 border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {filteredEvents.map((evt) => {
            const isOfficer = evt.actor.startsWith('OFF-');
            const isWarning = evt.status === 'WARNING';
            return (
              <div key={evt.id} className="relative group">
                {/* Timeline node icon */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                    isWarning
                      ? 'bg-amber-950 border-amber-400 text-amber-300'
                      : isOfficer
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-950 border-slate-600 text-slate-400'
                  }`}
                >
                  {isWarning ? (
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  )}
                </div>

                {/* Event Card Content */}
                <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800/80 hover:border-cyan-500/40 transition-colors space-y-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white tracking-tight">{evt.action}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 border border-slate-700 text-cyan-300">
                        {evt.test_id}
                      </span>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      <span>·</span>
                      <span>{new Date(evt.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-850">
                    <div>
                      <span>Actor: </span>
                      <span className={isOfficer ? 'text-cyan-300 font-semibold' : 'text-slate-300'}>
                        {evt.actor}
                      </span>
                    </div>
                    <div>
                      <span>Event Ref: </span>
                      <span className="text-slate-500">{evt.id}</span>
                    </div>
                    <div>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] ${
                          evt.status === 'SUCCESS'
                            ? 'bg-emerald-950/60 text-emerald-400'
                            : 'bg-amber-950/60 text-amber-400'
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="py-12 text-slate-500 text-xs">
              No audit records matched your filter criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
