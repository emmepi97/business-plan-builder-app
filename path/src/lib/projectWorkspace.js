import { createBlankData, loadProjectData, normalizeProjectData } from './storage.js';

export const WORKSPACE_KEY = 'bpb-ragionato-workspace-v1';
const makeId = () => globalThis.crypto?.randomUUID?.() || `bp-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const makeProject = (data, title) => {
  const normalized = normalizeProjectData(data);
  const id = makeId();
  const name = title || normalized.meta.title || 'Nuovo business plan';
  return { id, name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), data: { ...normalized, meta: { ...normalized.meta, title: name } } };
};
export function createWorkspace(data = createBlankData()) {
  const project = makeProject(data, data?.meta?.title || 'Il mio business plan');
  return { schemaVersion: 1, activeId: project.id, projects: [project] };
}
export function normalizeWorkspace(raw) {
  if (!raw || !Array.isArray(raw.projects) || raw.projects.length === 0) throw new Error('Workspace non valido');
  const projects = raw.projects.map(p => ({
    id: String(p.id || makeId()), name: String(p.name || p.data?.meta?.title || 'Business plan'),
    createdAt: p.createdAt || new Date().toISOString(), updatedAt: p.updatedAt || new Date().toISOString(),
    data: normalizeProjectData(p.data)
  }));
  const activeId = projects.some(p => p.id === raw.activeId) ? raw.activeId : projects[0].id;
  return { schemaVersion: 1, activeId, projects };
}
export function loadWorkspace(storage = globalThis.localStorage) {
  try {
    const saved = storage?.getItem(WORKSPACE_KEY);
    if (saved) return normalizeWorkspace(JSON.parse(saved));
  } catch (error) { console.warn('Workspace non leggibile, provo il recupero del progetto singolo', error); }
  return createWorkspace(loadProjectData(storage));
}
export function saveWorkspace(workspace, storage = globalThis.localStorage) {
  const normalized = normalizeWorkspace(workspace);
  storage?.setItem(WORKSPACE_KEY, JSON.stringify(normalized));
  return normalized;
}
export function addWorkspaceProject(workspace, data = createBlankData(), title) {
  const project = makeProject(data, title || 'Nuovo business plan');
  return { ...workspace, activeId: project.id, projects: [...workspace.projects, project] };
}
export function duplicateWorkspaceProject(workspace, id) {
  const source = workspace.projects.find(p => p.id === id);
  if (!source) return workspace;
  const copy = makeProject(source.data, `${source.name} (copia)`);
  return { ...workspace, activeId: copy.id, projects: [...workspace.projects, copy] };
}
export function updateWorkspaceProject(workspace, id, data) {
  return { ...workspace, projects: workspace.projects.map(p => p.id === id ? { ...p, name: data.meta?.title || p.name, updatedAt: new Date().toISOString(), data: normalizeProjectData(data) } : p) };
}
export function removeWorkspaceProject(workspace, id) {
  if (workspace.projects.length <= 1) throw new Error('Deve rimanere almeno un business plan');
  const projects = workspace.projects.filter(p => p.id !== id);
  return { ...workspace, projects, activeId: workspace.activeId === id ? projects[0].id : workspace.activeId };
}
export function activateWorkspaceProject(workspace, id) {
  if (!workspace.projects.some(p => p.id === id)) return workspace;
  return { ...workspace, activeId: id };
}
