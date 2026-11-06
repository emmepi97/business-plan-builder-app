export const STORAGE_KEY = 'bpb-ragionato-v4';
export const LEGACY_STORAGE_KEYS = ['bpb-ragionato-v3', 'bpb-ragionato-v2', 'bpb-ragionato-v1'];

export function createBlankData() {
  const now = new Date().toISOString();
  return { meta: { title: 'Il mio business plan', updatedAt: null, createdAt: now, schemaVersion: 4 }, answers: {}, lists: {}, quality: {} };
}

export function normalizeProjectData(raw) {
  if (!raw || typeof raw !== 'object' || !raw.answers || !raw.lists) {
    throw new Error('Formato progetto non riconosciuto');
  }
  const blank = createBlankData();
  return {
    ...blank,
    ...raw,
    meta: { ...blank.meta, ...(raw.meta || {}), schemaVersion: 4 },
    answers: { ...raw.answers },
    lists: Object.fromEntries(Object.entries(raw.lists).map(([key, rows]) => [key, Array.isArray(rows) ? rows : []])),
    quality: raw.quality && typeof raw.quality === 'object' ? { ...raw.quality } : {}
  };
}

export function loadProjectData(storage = globalThis.localStorage) {
  for (const key of [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]) {
    try {
      const raw = storage?.getItem(key);
      if (raw) return normalizeProjectData(JSON.parse(raw));
    } catch (error) {
      console.warn(`Impossibile leggere il progetto salvato (${key})`, error);
    }
  }
  return createBlankData();
}

export function saveProjectData(data, storage = globalThis.localStorage) {
  const normalized = normalizeProjectData(data);
  const saved = { ...normalized, meta: { ...normalized.meta, updatedAt: new Date().toISOString() } };
  storage?.setItem(STORAGE_KEY, JSON.stringify(saved));
  return saved;
}
