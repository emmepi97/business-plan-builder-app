import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// GitHub Pages: ricava automaticamente il nome del repository dall'ambiente Actions.
// La cartella sorgente 'path/' NON compare nell'URL pubblica: viene pubblicata la sua dist/.
const repository = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserOrOrgSite = repository?.endsWith('.github.io');
const base = process.env.GITHUB_ACTIONS
  ? (repository && !isUserOrOrgSite ? `/${repository}/` : '/')
  : './';

export default defineConfig({
  plugins: [react()],
  base,
});
