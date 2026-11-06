import { calculateFinancialModel } from './financialModel.js';

const n = value => { const x = Number(String(value ?? '').trim().replace(',', '.')); return Number.isFinite(x) ? x : 0; };
const has = value => value !== undefined && value !== null && String(value).trim() !== '';

/** Rule-based consistency review. It flags items for human review; it never certifies a business. */
export function validateBusinessPlan(data = {}) {
  const a = data.answers || {};
  const lists = data.lists || {};
  const model = calculateFinancialModel(data);
  const findings = [];
  const add = (severity, code, title, detail, recommendation) => findings.push({ severity, code, title, detail, recommendation });

  const market = n(a['mercato.mercatoOttenibile']);
  const tam = n(a['mercato.mercatoTotale']);
  const sam = n(a['mercato.mercatoServibile']);
  if (tam > 0 && sam > tam) add('error','market-sam-tam','SAM superiore al TAM',`SAM (${sam}) risulta maggiore del mercato totale TAM (${tam}).`,'Verifica perimetro geografico, segmento e unità di misura.');
  if (sam > 0 && market > sam) add('error','market-som-sam','SOM superiore al SAM',`SOM (${market}) supera il mercato servibile SAM (${sam}).`,'Rivedi la quota realisticamente conquistabile o il dimensionamento del mercato.');
  if (market > 0 && model.years[0]?.revenue > market) add('warning','revenue-vs-som','Ricavi superiori al mercato ottenibile',`I ricavi previsti per l'anno 1 (${Math.round(model.years[0].revenue)}) superano il SOM dichiarato (${market}).`,'Controlla che ricavi e dimensionamento del mercato si riferiscano allo stesso periodo e perimetro.');

  const products = lists.prodotti || [];
  products.forEach((p,i) => {
    const price=n(p.prezzoIpotesi), cost=n(p.costoUnitario), cap=n(p.capacitaMensile);
    const qty=n(p.quantitaAnno1);
    const label=p.nome || `Prodotto/servizio ${i+1}`;
    if (has(p.prezzoIpotesi) && has(p.costoUnitario) && cost > price) add('error',`unit-margin-${i}`,`Margine unitario negativo: ${label}`,`Il costo variabile unitario (${cost}) supera il prezzo (${price}).`,'Rivedi prezzo, distinta costi o modello di erogazione.');
    if (cap > 0 && qty > cap*12) add('error',`capacity-${i}`,`Capacità insufficiente: ${label}`,`Quantità annua prevista (${qty}) supera la capacità annua teorica (${cap*12}).`,'Aumenta capacità, risorse o tempi di consegna oppure riduci i volumi previsti.');
    if (has(p.prezzoIpotesi) && price <= 0) add('warning',`price-${i}`,`Prezzo non positivo: ${label}`,'Il prezzo inserito è nullo o negativo.','Inserisci il prezzo effettivo oppure documenta un modello gratuito/sovvenzionato.');
  });

  const available = model.availableSources;
  if (model.fundingGap > 0) add('error','funding-gap','Fabbisogno iniziale non coperto',`Mancano circa ${Math.round(model.fundingGap)} per coprire investimenti e capitale circolante iniziale.`,'Individua fonti aggiuntive o rivedi tempi e dimensione degli investimenti.');
  if (available > 0 && model.initialFundingNeed === 0) add('warning','sources-no-need','Fonti finanziarie senza fabbisogno dichiarato','Sono indicate fonti disponibili ma non risultano investimenti o capitale circolante iniziale.','Verifica se il fabbisogno è stato compilato nelle sezioni corrette.');
  if (model.years[0]?.revenue > 0 && model.years[0]?.ebitda < 0) add('warning','negative-ebitda','EBITDA negativo nello scenario base',`L'EBITDA previsto per l'anno 1 è ${Math.round(model.years[0].ebitda)}.`,'Valuta prezzi, volumi, costi variabili e struttura dei costi fissi.');
  if (model.years[0]?.revenue > 0 && model.breakEven > model.years[0].revenue) add('warning','below-breakeven','Ricavi inferiori al break-even',`Ricavi anno 1 (${Math.round(model.years[0].revenue)}) inferiori al break-even stimato (${Math.round(model.breakEven)}).`,'Stima quando e come il progetto può superare il punto di pareggio.');

  const validationFields = [
    ['cliente.interviste','Evidenze di confronto con potenziali clienti'],['cliente.disponibilita','Evidenze di disponibilità a pagare'],
    ['mercato.fontiMercato','Fonti per il dimensionamento del mercato'],['commerciale.canali','Canali di vendita definiti'],
    ['operations.processo','Processo operativo descritto'],['fattibilita.azioni','Azioni di mitigazione dei rischi']
  ];
  validationFields.forEach(([key,label])=>{ if (!has(a[key])) add('info',`missing-${key}`,`${label} mancanti`,'Non risultano informazioni inserite su questo aspetto.','Completa la sezione oppure indica esplicitamente perché non è applicabile.'); });
  if (!products.length) add('info','no-products','Nessun prodotto o servizio strutturato','Non è stato inserito alcun prodotto/servizio nella sezione dedicata.','Descrivi almeno l’offerta principale per rendere verificabili prezzi, volumi e capacità.');

  const severityRank = { error:0, warning:1, info:2 };
  findings.sort((x,y)=>severityRank[x.severity]-severityRank[y.severity]);
  const counts = { error:findings.filter(x=>x.severity==='error').length, warning:findings.filter(x=>x.severity==='warning').length, info:findings.filter(x=>x.severity==='info').length };
  const penalty = counts.error*12 + counts.warning*5 + counts.info*1.5;
  const score = Math.max(0, Math.round(100-penalty));
  return { score, counts, findings, modelChecks: { revenue:model.years[0]?.revenue || 0, breakEven:model.breakEven, fundingGap:model.fundingGap } };
}
