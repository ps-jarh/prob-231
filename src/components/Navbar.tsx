import React from 'react';
import { Shield, Radio, Wifi, WifiOff, RefreshCw, Plus, User } from 'lucide-react';
import { Officer } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  officer: Officer;
  isOffline: boolean;
  onToggleOffline: () => void;
  pendingSyncCount: number;
  onSync: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  officer,
  isOffline,
  onToggleOffline,
  pendingSyncCount,
  onSync,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark with shield icon */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded border border-cyan-500/40 bg-cyan-950/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-400 transition-colors">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-wider text-white">
                BiOrion
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-mono text-cyan-400/90 tracking-tight">
                SIH-26231
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Clean 4-6 text navigation links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-slate-800/80 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onSelectTab('new-test')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors ${
              currentTab === 'new-test'
                ? 'bg-cyan-500 text-slate-950 shadow-sm shadow-cyan-500/20'
                : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/60'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            New Test
          </button>
          <button
            onClick={() => onSelectTab('evidence')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentTab === 'evidence'
                ? 'bg-slate-800/80 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Evidence Repository
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentTab === 'analytics'
                ? 'bg-slate-800/80 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => onSelectTab('audit')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              currentTab === 'audit'
                ? 'bg-slate-800/80 text-cyan-300 border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail
          </button>
        </nav>

        {/* Zone 3: Primary operational controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Offline / Online status button */}
          <button
            onClick={onToggleOffline}
            title={isOffline ? 'Currently Offline (Click to go Online)' : 'Currently Online (Click to simulate Field Offline)'}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-all border ${
              isOffline
                ? 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                : 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline font-medium">OFFLINE</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline font-medium">ONLINE</span>
              </>
            )}
          </button>

          {/* Sync status if pending */}
          {pendingSyncCount > 0 && (
            <button
              onClick={onSync}
              title="Click to synchronize offline records"
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/50 animate-pulse"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>{pendingSyncCount} pending</span>
            </button>
          )}

          {/* Officer Profile Badge */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="text-right hidden lg:block">
              <div className="text-xs font-semibold text-slate-200 leading-tight">
                {officer.name}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {officer.officer_id} · {officer.station}
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Operator Menu / Log Out"
              className="w-8 h-8 rounded border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 flex items-center justify-center transition-colors"
            >
              <User className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
