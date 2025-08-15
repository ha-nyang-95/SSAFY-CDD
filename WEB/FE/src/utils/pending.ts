import type { Inspection } from '../api/types';

export type PendingInspection = {
  id: string;
  name: string;
  sessionId: string;
  location: string;
  createdAtISO: string;
};

const STORAGE_KEY = 'cdd_pending_inspections';

function readStore(): PendingInspection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return parsed as PendingInspection[];
    return [];
  } catch {
    return [];
  }
}

function writeStore(items: PendingInspection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function addPendingInspection(item: PendingInspection): void {
  const list = readStore();
  const exists = list.some((x) => x.id === item.id);
  if (!exists) {
    list.unshift(item);
    writeStore(list);
  }
}

export function removePendingInspection(id: string): void {
  const list = readStore().filter((x) => x.id !== id);
  writeStore(list);
}

export function getPendingInspections(): PendingInspection[] {
  return readStore();
}

export function mergePendingWithInspections(
  serverInspections: Inspection[],
): Inspection[] {
  const pending = getPendingInspections();
  const serverIds = new Set(serverInspections.map((i) => i.id));
  // drop pending already present in server list (server is source of truth)
  const stillPending = pending.filter((p) => !serverIds.has(p.id));
  // map pending to Inspection type with LIVE status
  const pendingAsInspections: Inspection[] = stillPending.map((p) => ({
    id: p.id,
    name: p.name,
    sessionId: p.sessionId,
    date: p.createdAtISO,
    status: 'LIVE',
    location: p.location,
  }));
  return [...pendingAsInspections, ...serverInspections];
}


