import { AuditEvent, DrugTest, Officer } from '../types';
import { CURRENT_OFFICER, INITIAL_TEST_RECORDS } from './mockData';

const STORAGE_KEY_TESTS = 'biorion_tests_v1';
const STORAGE_KEY_OFFICER = 'biorion_officer_v1';
const STORAGE_KEY_OFFLINE = 'biorion_is_offline_v1';

export function getStoredOfficer(): Officer {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFICER);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return CURRENT_OFFICER;
}

export function setStoredOfficer(officer: Officer): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFICER, JSON.stringify(officer));
  } catch {
    // ignore
  }
}

export function getStoredTests(): DrugTest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TESTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  // Initialize with seed data
  saveStoredTests(INITIAL_TEST_RECORDS);
  return INITIAL_TEST_RECORDS;
}

export function saveStoredTests(tests: DrugTest[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TESTS, JSON.stringify(tests));
  } catch {
    // ignore
  }
}

export function addTestRecord(record: DrugTest): void {
  const current = getStoredTests();
  const updated = [record, ...current];
  saveStoredTests(updated);
}

export function updateTestRecord(record: DrugTest): void {
  const current = getStoredTests();
  const updated = current.map((t) => (t.id === record.id ? record : t));
  saveStoredTests(updated);
}

export function getGlobalAuditTrail(): AuditEvent[] {
  const tests = getStoredTests();
  const events: AuditEvent[] = [];
  tests.forEach((t) => {
    if (t.audit_trail) {
      events.push(...t.audit_trail);
    }
  });
  // Sort descending by timestamp
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export function getOfflineMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_OFFLINE) === 'true';
  } catch {
    return false;
  }
}

export function setOfflineMode(offline: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_OFFLINE, offline ? 'true' : 'false');
  } catch {
    // ignore
  }
}

export function syncPendingRecords(): { syncedCount: number } {
  const tests = getStoredTests();
  let count = 0;
  const updated = tests.map((t) => {
    if (!t.is_synced) {
      count++;
      return { ...t, is_synced: true };
    }
    return t;
  });
  if (count > 0) {
    saveStoredTests(updated);
  }
  return { syncedCount: count };
}

export function resetDemoDatabase(): void {
  saveStoredTests(INITIAL_TEST_RECORDS);
  setStoredOfficer(CURRENT_OFFICER);
  setOfflineMode(false);
}
