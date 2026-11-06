import test from 'node:test';
import assert from 'node:assert/strict';
import { createBlankData } from '../lib/storage.js';
import { createWorkspace, addWorkspaceProject, duplicateWorkspaceProject, updateWorkspaceProject, removeWorkspaceProject, saveWorkspace, loadWorkspace, normalizeWorkspace, WORKSPACE_KEY } from '../lib/projectWorkspace.js';

test('crea, duplica, aggiorna e rimuove progetti senza perdere gli altri', () => {
  let w = createWorkspace(createBlankData());
  const first = w.activeId;
  w = addWorkspaceProject(w, createBlankData(), 'Secondo progetto');
  const second = w.activeId;
  assert.equal(w.projects.length, 2);
  w = duplicateWorkspaceProject(w, first);
  assert.equal(w.projects.length, 3);
  assert.match(w.projects.find(p => p.id === w.activeId).name, /copia/);
  const edited = { ...w.projects.find(p => p.id === second).data, answers: { test: 'dato' } };
  w = updateWorkspaceProject(w, second, edited);
  assert.equal(w.projects.find(p => p.id === second).data.answers.test, 'dato');
  w = removeWorkspaceProject(w, second);
  assert.equal(w.projects.length, 2);
});

test('salva e ricarica il workspace da localStorage compatibile', () => {
  const memory = new Map();
  const storage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v) };
  const w = createWorkspace(createBlankData());
  saveWorkspace(w, storage);
  const loaded = loadWorkspace(storage);
  assert.equal(loaded.projects.length, 1);
  assert.equal(loaded.activeId, w.activeId);
  assert.ok(memory.has(WORKSPACE_KEY));
});

test('recupera il progetto legacy se il workspace salvato è danneggiato', () => {
  const memory = new Map([[WORKSPACE_KEY, '{json non valido']]);
  const storage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v) };
  const loaded = loadWorkspace(storage);
  assert.equal(loaded.projects.length, 1);
  assert.ok(loaded.activeId);
});

test('normalizza un activeId non presente scegliendo il primo progetto', () => {
  const w = createWorkspace(createBlankData());
  const normalized = normalizeWorkspace({ ...w, activeId: 'inesistente' });
  assert.equal(normalized.activeId, normalized.projects[0].id);
});
