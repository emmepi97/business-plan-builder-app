# Business Plan Builder Ragionato — 0.11.0

Il codice dell'applicazione si trova nella cartella `path/`. Il workflow GitHub Actions deve invece restare nella cartella `.github/workflows/` alla radice del repository.

## Caricamento corretto su GitHub

Nella **radice** del repository devono comparire esattamente questi elementi:

```text
repository/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── path/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
└── README.md
```

Non caricare la cartella `path` come unica cartella del repository: anche `.github/workflows/deploy.yml` deve essere presente alla radice.

## Pubblicazione

1. Carica `path/`, `.github/` e `README.md` nella radice del repository GitHub.
2. Il branch predefinito può essere `main` o `master`: il workflow si attiva a ogni push.
3. Apri **Settings → Pages** e imposta **Source: GitHub Actions**.
4. Apri **Actions → Deploy to GitHub Pages**. Deve risultare completato con il segno verde.
5. Apri **Settings → Pages** e usa il link pubblicato da GitHub.

La configurazione Vite ricava automaticamente il nome del repository da GitHub Actions. Per un normale repository chiamato `business-plan-builder`, l'URL sarà `https://USERNAME.github.io/business-plan-builder/`. La cartella sorgente `path/` non diventa una parte dell'URL: GitHub pubblica il contenuto compilato di `path/dist/` alla radice del sito.

## Se compare ancora 404

- Se non compare alcuna esecuzione in **Actions**, controlla che `.github/workflows/deploy.yml` sia davvero alla radice e che il push sia stato effettuato.
- Se il workflow è rosso, apri l'esecuzione e leggi il primo errore nel job `build` o `deploy`.
- Se il workflow è verde ma il sito restituisce 404, verifica **Settings → Pages** e apri l'URL esatto mostrato da GitHub, non un URL costruito a mano.

## Avvio locale

Apri un terminale dentro `path/` ed esegui `npm install` e poi `npm run dev`.

I dati sono salvati nel browser (`localStorage`): esporta periodicamente il backup JSON. GitHub Pages non fornisce account o sincronizzazione cloud.
