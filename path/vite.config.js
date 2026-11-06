import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Repository GitHub Pages: https://USERNAME.github.io/business-plan-builder/
// In locale mantiene un percorso relativo per npm run dev.
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS ? '/business-plan-builder/' : './',
});
