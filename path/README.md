# Business Plan Builder Ragionato

Versione 0.11.0 — Collaudo e stabilizzazione del workspace multi-progetto.

Web app in italiano per costruire un business plan guidato in 12 fasi, con controlli sulla qualità delle informazioni e un modello economico-finanziario gestionale triennale.

## Versione 0.5.0 — Architettura e stabilizzazione
- Separazione del modello finanziario in `src/lib/financialModel.js`, riutilizzato da dashboard e PDF.
- Gestione dati e migrazione centralizzata in `src/lib/storage.js`.
- Migrazione automatica delle chiavi browser v1, v2 e v3 alla nuova chiave v4.
- Normalizzazione dei backup importati e conservazione di risposte, liste e classificazione delle informazioni.
- Test automatici Node.js per calcoli finanziari e persistenza/migrazione.
- Dipendenze e workflow di build mantenuti compatibili con GitHub Pages.

## Gestione multi-progetto (0.10.0)
- Workspace locale con più business plan indipendenti.
- Creazione, selezione, duplicazione ed eliminazione dei progetti.
- Salvataggio automatico per progetto e mantenimento del progetto singolo legacy al primo avvio.
- Backup JSON e PDF riferiti al progetto selezionato.

## Funzionalità
- Percorso guidato in 12 fasi con obiettivo, sezioni e checkpoint decisionali.
- Salvataggio automatico in `localStorage` (nessun invio dei dati a un server).
- Classificazione di ogni informazione: da verificare, ipotesi/stima, verificato.
- Backup e ripristino JSON.
- Motore economico-finanziario triennale: conto economico gestionale, EBITDA, EBIT, utile netto, cash flow semplificato, break-even, fabbisogno iniziale e copertura.
- Scenari prudente, base e favorevole con sensibilità dei ricavi ±20%.
- Esportazione PDF tramite stampa del browser.

## Requisiti
Node.js 20.19+ oppure 22.12+.

## Avvio
```bash
npm install
npm run dev
```

## Test e build
```bash
npm test
npm run build
npm run preview
```

## Pubblicazione su GitHub Pages
1. Carica il contenuto della cartella in un repository GitHub.
2. Usa il branch `main`.
3. In GitHub vai su **Settings → Pages** e imposta **Source: GitHub Actions**.
4. Il workflow `.github/workflows/deploy.yml` pubblicherà la cartella `dist` a ogni push su `main`.

## Dati e privacy
I dati sono salvati localmente nel browser tramite `localStorage`. Se cancelli i dati del sito/browser o cambi dispositivo, potresti perderli: scarica periodicamente il backup JSON.

## Limiti del modello finanziario
Il modello attuale è gestionale e semplificato: non comprende IVA, stato patrimoniale completo, piano di rimborso del debito, variazioni mensili/annuali del capitale circolante o calcolo fiscale puntuale. Le ipotesi vanno verificate prima di decisioni d'investimento.


## Versione 0.5.0 – Forecast integrato

Questa versione aggiunge un forecast mensile di cassa su 36 mesi, con ipotesi configurabili per IVA, ritardi medi di incasso/pagamento e cassa iniziale. Il prospetto mensile è esposto nel motore finanziario e segnala esplicitamente le semplificazioni.

### Limiti del modello 0.5
- Ricavi e costi sono distribuiti uniformemente nei mesi.
- IVA calcolata con aliquota unica e liquidazione mensile semplificata.
- Il ritardo di incasso/pagamento è uno slittamento medio, non uno scadenzario analitico.
- Non è ancora un bilancio civilistico integrato: stato patrimoniale, debito finanziario e patrimonio netto analitici sono demandati alle iterazioni successive.

Test: `npm test`. Build: `npm run build`.


## Versione 0.7.0 – Modello commerciale e operativo

- Ricavi analitici per prodotto/servizio: quantità × prezzo unitario.
- Costi variabili unitari e margine di contribuzione per prodotto.
- Collegamento delle previsioni commerciali al conto economico e al forecast di cassa.
- Controlli preliminari sulla capacità mensile dichiarata e sulle quantità annuali.
- Compatibilità retroattiva: se non sono compilati prezzi e volumi, restano valide le previsioni annuali manuali.

Il modello non ripartisce ancora le vendite su una curva mensile stagionale: la stagionalità è raccolta come ipotesi descrittiva e sarà resa parametrica in una successiva iterazione.

## Versione 0.7.0

Aggiunge analisi di scenario prudente/base/favorevole, stress test della liquidità, matrice di sensibilità prezzo-volume e KPI gestionali (margine di contribuzione, ROS, ROI indicativo e break-even). Le ipotesi sono esplicite; ROE e DSCR non vengono mostrati finché non sono disponibili dati patrimoniali e un piano del debito attendibili.


## Versione 0.8.0 – Validazione intelligente

Aggiunge controlli deterministici di coerenza su dimensionamento mercato (TAM/SAM/SOM), margini unitari, capacità produttiva, copertura del fabbisogno, EBITDA e break-even. La dashboard mostra un indice orientativo (0–100), criticità, attenzioni e approfondimenti. Il punteggio è una checklist euristica, non un rating certificato né una valutazione professionale.

Test: `npm test` (18 test). Build: `npm run build` (richiede dipendenze installate con `npm install`).

## Versione 0.9.0 — Report professionale

Questa versione amplia l'esportazione PDF con:
- indice del documento;
- executive summary generato esclusivamente dai dati disponibili;
- KPI sintetici e informazioni su mercato, offerta e fabbisogno;
- scenari e matrice di sensibilità;
- previsione di cassa dei primi 12 mesi (il motore elabora 36 mesi);
- report delle verifiche automatiche e della qualità delle evidenze;
- tutte le 12 fasi del percorso.

Il report segnala i campi mancanti senza inventare informazioni. Gli indicatori sono gestionali e orientativi, non costituiscono una certificazione né un parere fiscale o contabile.

Test: `npm test`.


## Versione 0.11.0 — Collaudo e stabilizzazione
- Caricamento iniziale del workspace eseguito una sola volta e condiviso con lo stato del progetto attivo.
- Rafforzata la coerenza tra progetto selezionato e dati visualizzati all'avvio.
- Verificati i flussi di creazione, duplicazione, aggiornamento, eliminazione e persistenza dei progetti.
- Test automatici aggiornati per i casi principali del workspace.

Prima della pubblicazione eseguire `npm install`, `npm test` e `npm run build` in un ambiente con Node.js compatibile.

## Pubblicazione in repository con cartella path

Le istruzioni di pubblicazione per questa distribuzione sono nel `README.md` nella radice del repository. Il workflow GitHub Actions è collocato nella radice `.github/workflows/` perché GitHub non esegue workflow conservati in sottocartelle.
