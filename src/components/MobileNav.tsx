import React from 'react';
import { LayoutDashboard, Plus, FileText, BarChart3, Clock } from 'lucide-react';

interface MobileNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab }) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md px-3 py-2">
      <div className="flex items-center justify-around">
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded transition-colors ${
            currentTab === 'dashboard' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('evidence')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded transition-colors ${
            currentTab === 'evidence' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Evidence</span>
        </button>

        {/* Big Center Action: START NEW TEST */}
        <button
          onClick={() => onSelectTab('new-test')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-13 h-13 rounded-full bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 flex items-center justify-center border-4 border-slate-950 active:scale-95 transition-transform">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-semibold text-cyan-400 mt-0.5 tracking-tight">New Test</span>
        </button>

        <button
          onClick={() => onSelectTab('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded transition-colors ${
            currentTab === 'analytics' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Analytics</span>
        </button>

        <button
          onClick={() => onSelectTab('audit')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded transition-colors ${
            currentTab === 'audit' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight">Audit</span>
        </button>
      </div>
    </div>
  );
};
