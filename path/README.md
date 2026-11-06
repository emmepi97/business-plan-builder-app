# Business Plan Builder Ragionato 0.11.0

## Pubblicazione su GitHub Pages

Questa cartella contiene TUTTO il progetto, inclusa la configurazione GitHub Actions.

**Importante:** estrai lo ZIP, apri questa cartella `path` e carica TUTTI gli elementi contenuti direttamente nella radice del repository GitHub. Non caricare la cartella `path` come sottocartella del repository. La cartella `.github` deve risultare visibile nella radice del repository come `.github/workflows/deploy.yml`.

Poi apri GitHub → Settings → Pages e seleziona `GitHub Actions` come Source. Il workflow parte a ogni push su `main` o `master`.

## Avvio locale

Richiede Node.js 22 o successivo.

```bash
npm install
npm run dev
```

## Test e build

```bash
npm run test
npm run build
```
