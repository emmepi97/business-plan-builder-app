import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlankData, normalizeProjectData, loadProjectData, saveProjectData, STORAGE_KEY } from '../lib/storage.js';

test('normalizza backup precedenti preservando risposte, elenchi e qualità', () => {
  const normalized = normalizeProjectData({ answers: { 'progetto.nomeProgetto': 'Demo' }, lists: { soci: [{ nome: 'Ada' }] }, quality: { x: 'verificato' } });
  assert.equal(normalized.meta.schemaVersion, 4);
  assert.equal(normalized.answers['progetto.nomeProgetto'], 'Demo');
  assert.equal(normalized.lists.soci[0].nome, 'Ada');
  assert.equal(normalized.quality.x, 'verificato');
});

test('carica chiave legacy e salva nella chiave corrente', () => {
  const memory = new Map([['bpb-ragionato-v3', JSON.stringify({ ...createBlankData(), answers: { test: 'ok' }, lists: {} })]]);
  const storage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
  const loaded = loadProjectData(storage);
  assert.equal(loaded.answers.test, 'ok');
  saveProjectData(loaded, storage);
  assert.ok(memory.has(STORAGE_KEY));
});
