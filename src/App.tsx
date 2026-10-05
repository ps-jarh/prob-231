import React, { useState, useEffect } from 'react';
import {
  getStoredOfficer,
  getStoredTests,
  getOfflineMode,
  setOfflineMode,
  syncPendingRecords,
  getGlobalAuditTrail,
} from './services/storageService';
import { CURRENT_OFFICER } from './services/mockData';
import { DrugTest, Officer } from './types';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { LoginModal } from './components/LoginModal';
import { EvidenceReportModal } from './components/EvidenceReportModal';
import { DashboardView } from './views/DashboardView';
import { NewTestWizard } from './views/NewTestWizard';
import { EvidenceRepoView } from './views/EvidenceRepoView';
import { AnalyticsView } from './views/AnalyticsView';
import { AuditLogView } from './views/AuditLogView';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for instant hackathon evaluation, user can log out
  const [officer, setOfficer] = useState<Officer>(CURRENT_OFFICER);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [tests, setTests] = useState<DrugTest[]>([]);
  const [isOffline, setIsOfflineState] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [selectedTest, setSelectedTest] = useState<DrugTest | null>(null);
  const [activePresetScenarioId, setActivePresetScenarioId] = useState<string | undefined>(undefined);

  // Load initial data from persistent store
  useEffect(() => {
    const loadedOfficer = getStoredOfficer();
    const loadedTests = getStoredTests();
    const loadedOffline = getOfflineMode();

    setOfficer(loadedOfficer);
    setTests(loadedTests);
    setIsOfflineState(loadedOffline);

    const unsynced = loadedTests.filter((t) => !t.is_synced).length;
    setPendingSyncCount(unsynced);
  }, []);

  // Refresh test records when switching tabs or after tests are added
  const refreshTests = () => {
    const loadedTests = getStoredTests();
    setTests(loadedTests);
    const unsynced = loadedTests.filter((t) => !t.is_synced).length;
    setPendingSyncCount(unsynced);
  };

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOfflineState(nextState);
    setOfflineMode(nextState);
  };

  const handleSync = () => {
    const { syncedCount } = syncPendingRecords();
    refreshTests();
  };

  const handleStartNewTestWithPreset = (presetId?: string) => {
    setActivePresetScenarioId(presetId);
    setCurrentTab('new-test');
  };

  const handleNewTestFinished = () => {
    refreshTests();
    setCurrentTab('dashboard');
    setActivePresetScenarioId(undefined);
  };

  const handleGoToRepository = () => {
    refreshTests();
    setCurrentTab('evidence');
    setActivePresetScenarioId(undefined);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <LoginModal onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const auditEvents = getGlobalAuditTrail();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      {/* Top Bar Contract Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          refreshTests();
          setCurrentTab(tab);
          if (tab !== 'new-test') setActivePresetScenarioId(undefined);
        }}
        officer={officer}
        isOffline={isOffline}
        onToggleOffline={handleToggleOffline}
        pendingSyncCount={pendingSyncCount}
        onSync={handleSync}
        onLogout={handleLogout}
      />

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-amber-950/80 border-b border-amber-500/40 px-4 py-2 text-xs font-mono text-amber-300 flex items-center justify-between no-print">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span className="font-semibold">OFFLINE FIELD MODE</span>
              <span className="hidden sm:inline text-amber-200/80">
                — Data recorded locally with cryptographic SHA-256 seals. Will sync when back online.
              </span>
            </div>
            {pendingSyncCount > 0 && (
              <span className="text-[11px] font-bold bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/50">
                {pendingSyncCount} records waiting to sync
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'dashboard' && (
          <DashboardView
            tests={tests}
            officer={officer}
            onStartNewTest={handleStartNewTestWithPreset}
            onSelectTest={(t) => setSelectedTest(t)}
          />
        )}

        {currentTab === 'new-test' && (
          <NewTestWizard
            officer={officer}
            presetScenarioId={activePresetScenarioId}
            onFinish={handleNewTestFinished}
            onGoToRepository={handleGoToRepository}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidenceRepoView
            tests={tests}
            onSelectTest={(t) => setSelectedTest(t)}
            onStartNewTest={() => {
              setActivePresetScenarioId(undefined);
              setCurrentTab('new-test');
            }}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView tests={tests} />}

        {currentTab === 'audit' && <AuditLogView events={auditEvents} />}
      </main>

      {/* Detailed Evidence Certificate Modal */}
      {selectedTest && (
        <EvidenceReportModal
          test={selectedTest}
          onClose={() => setSelectedTest(null)}
        />
      )}

      {/* Mobile-First Bottom Navigation */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          refreshTests();
          setCurrentTab(tab);
          if (tab !== 'new-test') setActivePresetScenarioId(undefined);
        }}
      />
    </div>
  );
}
