import { buildCommercialModel } from './commercialModel.js';
const n = v => { const x = Number(String(v ?? '').trim().replace(',', '.')); return Number.isFinite(x) ? x : 0; };

/** Monthly cash forecast (36 months). All values are estimates, not statutory accounts.
 * Revenue and operating costs are spread evenly; VAT is modeled as net VAT payable monthly.
 * Financing rows are treated as initial funding only unless explicit debt assumptions are supplied.
 */
export function buildIntegratedForecast(data = {}) {
  const a = data.answers || {};
  const lists = data.lists || {};
  const commercial = buildCommercialModel(data);
  const years = commercial.years.map(row => row.revenue);
  const vatRate = Math.max(0, Math.min(100, n(a['finanza.iva'] || 22))) / 100;
  const collectionMonths = Math.max(0, Math.min(12, Math.round(n(a['finanza.giorniIncasso']) / 30)));
  const paymentMonths = Math.max(0, Math.min(12, Math.round(n(a['finanza.giorniPagamento']) / 30)));
  const openingCash = n(a['finanza.cassaIniziale']);
  const capex = (lists.investimenti || []).reduce((s,r)=>s+n(r.importo),0);
  const workingCapital = n(a['investimenti.scorte']) + n(a['investimenti.riserva']);
  const payroll = (lists.personale || []).reduce((s,r)=>s+n(r.numero)*n(r.costo),0);
  const fixedCosts = (lists.costi || []).reduce((s,r)=>{
    const v=n(r.importo); const annual=r.periodicita==='Mensile'?v*12:r.periodicita==='Trimestrale'?v*4:r.periodicita==='Una tantum'?0:v;
    return s+(r.tipo==='Variabile'?0:annual);
  },0) + payroll + n(a['commerciale.budgetMarketing']);
  const variableCosts = (lists.costi || []).reduce((s,r)=>{
    const v=n(r.importo); const annual=r.periodicita==='Mensile'?v*12:r.periodicita==='Trimestrale'?v*4:r.periodicita==='Una tantum'?0:v;
    return s+(r.tipo==='Variabile'?annual:0);
  },0);
  const base = years[0] || 0;
  const productVariable = commercial.years[0]?.variableCost || 0;
  const otherVariableRatio = base > 0 ? Math.min(0.95, variableCosts/base) : 0;
  const months=[];
  let cash=openingCash;
  let minCash=cash;
  for(let m=1;m<=36;m++){
    const y=Math.ceil(m/12)-1;
    const annualRevenue=years[y] || 0;
    const revenue=annualRevenue/12;
    const variable=(annualRevenue*otherVariableRatio + (commercial.years[y]?.variableCost || 0))/12;
    const fixed=(fixedCosts)/12;
    const collectedMonth=m-collectionMonths;
    const collected=collectedMonth>0 ? (years[Math.ceil(collectedMonth/12)-1]||0)/12 : 0;
    const paidMonth=m-paymentMonths;
    const paidYear=paidMonth>0 ? Math.ceil(paidMonth/12)-1 : -1;
    const paidVariable=paidMonth>0 ? (((years[paidYear]||0)*otherVariableRatio + (commercial.years[paidYear]?.variableCost || 0))/12) : 0;
    const vatDue=(collected-paidVariable)*vatRate;
    const operatingNet=collected-paidVariable-fixed-vatDue;
    const capexMonth=m===1?capex:0;
    const wcMonth=m===1?workingCapital:0;
    const net=operatingNet-capexMonth-wcMonth;
    cash+=net; minCash=Math.min(minCash,cash);
    months.push({month:m,year:y+1,revenue,collections:collected,variableCosts:variable,fixedCosts:fixed,vatDue,operatingNet,capex:capexMonth,workingCapital:wcMonth,netCash:net,closingCash:cash});
  }
  const annual=[1,2,3].map(y=>{
    const rows=months.filter(m=>m.year===y);
    return {year:y,openingCash:rows[0]?.closingCash-rows[0]?.netCash||0,collections:rows.reduce((s,r)=>s+r.collections,0),operatingNet:rows.reduce((s,r)=>s+r.operatingNet,0),capex:rows.reduce((s,r)=>s+r.capex,0),netCash:rows.reduce((s,r)=>s+r.netCash,0),closingCash:rows.at(-1)?.closingCash||0};
  });
  const assetsNet=capex; // no depreciation schedule is assumed in this release
  const indicativeBalance={cash:months.at(-1)?.closingCash||0,netInvestments:assetsNet,workingCapital,assets: (months.at(-1)?.closingCash||0)+assetsNet+workingCapital};
  const warnings=[];
  if(collectionMonths>0) warnings.push('Il ritardo di incasso è applicato con uno slittamento mensile semplificato, non con uno scadenzario clienti.');
  if(paymentMonths>0) warnings.push('Il ritardo di pagamento è applicato ai soli costi variabili; i costi fissi sono considerati pagati nel mese.');
  if(vatRate>0) warnings.push('IVA stimata con aliquota unica e liquidazione mensile; non sono modellati regimi speciali, detraibilità differenziata o calendario fiscale.');
  warnings.push(...commercial.warnings);
  warnings.push('Lo stato patrimoniale è ancora parziale: non include crediti/debiti analitici, patrimonio netto, ammortamenti e debiti finanziari.');
  return {months,annual,minCash,indicativeBalance,commercial,assumptions:{vatRate,collectionMonths,paymentMonths,openingCash},warnings};
}
