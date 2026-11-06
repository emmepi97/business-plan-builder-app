# Business Plan Builder Ragionato 0.11.0

Questa consegna contiene esclusivamente la cartella `path` e tutti i file del progetto al suo interno.

## Avvio locale

Richiede Node.js 22 o successivo.

```bash
npm install
npm run dev
```

Aprire l'indirizzo locale mostrato dal terminale.

## Test e build

```bash
npm test
npm run build
npm run preview
```

## Nota importante su GitHub Pages

GitHub Pages / GitHub Actions **non rileva workflow collocati in una sottocartella**: cerca i workflow esclusivamente in `.github/workflows` nella radice del repository. Inoltre, la pubblicazione Pages da branch supporta la radice del repository o `/docs`, non una cartella arbitraria chiamata `path`.

Quindi, se carichi questa cartella `path` come unica cartella nella radice del repository, il progetto resta organizzato e avviabile localmente, ma GitHub Pages non può avviare da solo il workflow qui contenuto e mostrerà 404 se non esiste un workflow esterno già configurato nella radice.

Il workflow incluso è predisposto per essere eseguito quando il contenuto di `path` è nel repository e il workflow è collocato nella posizione riconosciuta da GitHub. Non viene dichiarato come deploy verificato in questa consegna.

## Dati

I dati vengono salvati nel localStorage del browser. Esportare periodicamente un backup JSON; non c'è sincronizzazione cloud o autenticazione utenti.
