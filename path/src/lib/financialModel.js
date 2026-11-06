import { buildCommercialModel } from './commercialModel.js';
const toNumber = value => {
  const parsed = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

const annualizeCost = row => {
  const amount = toNumber(row.importo);
  if (row.periodicita === 'Mensile') return amount * 12;
  if (row.periodicita === 'Trimestrale') return amount * 4;
  if (row.periodicita === 'Una tantum') return 0;
  return amount;
};

export function calculateFinancialModel(data = {}) {
  const answers = data.answers || {};
  const lists = data.lists || {};
  const commercial = buildCommercialModel(data);
  const revenue = commercial.years.map(row => row.revenue);
  const taxRate = Math.max(0, Math.min(100, toNumber(answers['finanza.aliquota']))) / 100;
  const amortization = toNumber(answers['finanza.ammortamenti']);
  const interest = toNumber(answers['finanza.oneri']);
  const marketing = toNumber(answers['commerciale.budgetMarketing']);
  const costs = (lists.costi || []).reduce((total, row) => {
    const amount = annualizeCost(row);
    if (row.tipo === 'Variabile') total.variable += amount;
    else total.fixed += amount;
    return total;
  }, { fixed: 0, variable: 0 });
  const payroll = (lists.personale || []).reduce((sum, row) => sum + toNumber(row.numero) * toNumber(row.costo), 0);
  const investments = (lists.investimenti || []).reduce((sum, row) => sum + toNumber(row.importo), 0);
  const availableSources = (lists.fonti || []).filter(row => row.stato === 'Disponibile').reduce((sum, row) => sum + toNumber(row.importo), 0);
  const workingCapital = toNumber(answers['investimenti.scorte']) + toNumber(answers['investimenti.riserva']);
  const baseRevenue = revenue[0];
  const variableRatio = baseRevenue > 0 ? Math.min(0.95, (costs.variable + (commercial.years[0]?.variableCost || 0)) / baseRevenue) : 0;
  const contributionMarginRatio = 1 - variableRatio;
  const fixedAnnual = costs.fixed + payroll + marketing;
  const breakEven = contributionMarginRatio > 0 ? fixedAnnual / contributionMarginRatio : 0;

  const years = revenue.map((amount, index) => {
    const scale = baseRevenue > 0 ? amount / baseRevenue : 1;
    const variable = costs.variable * scale + (commercial.years[index]?.variableCost || 0);
    const ebitda = amount - variable - fixedAnnual;
    const ebit = ebitda - amortization;
    const taxableIncome = Math.max(0, ebit - interest);
    const taxes = taxableIncome * taxRate;
    const netIncome = ebit - interest - taxes;
    const operatingCash = ebitda - interest - taxes;
    const capex = index === 0 ? investments : 0;
    const netCash = operatingCash - capex - (index === 0 ? workingCapital : 0);
    return { year: index + 1, revenue: amount, variableCosts: variable, fixedCosts: fixedAnnual, ebitda, ebit, interest, taxes, netIncome, operatingCash, capex, workingCapital: index === 0 ? workingCapital : 0, netCash, ebitdaMargin: amount ? ebitda / amount : 0 };
  });

  const scenarios = [
    { name: 'Prudente', factor: 0.8 },
    { name: 'Base', factor: 1 },
    { name: 'Favorevole', factor: 1.2 }
  ].map(scenario => {
    const scenarioRevenue = baseRevenue * scenario.factor;
    const variable = scenarioRevenue * variableRatio;
    const ebitda = scenarioRevenue - variable - fixedAnnual;
    const ebit = ebitda - amortization;
    const taxes = Math.max(0, ebit - interest) * taxRate;
    return { ...scenario, revenue: scenarioRevenue, ebitda, netIncome: ebit - interest - taxes };
  });

  const warnings = [];
  warnings.push(...commercial.warnings);
  if (commercial.hasUnitForecast) warnings.push('Ricavi e costi variabili sono calcolati da quantità × prezzo e quantità × costo unitario. I ricavi manuali annuali sono ignorati finché è attivo il modello per prodotto/servizio.');
  if (!revenue.some(value => value > 0)) warnings.push('Inserisci i ricavi previsti per gli anni 1–3 nella fase 06.');
  if (!(costs.fixed || costs.variable || payroll || marketing)) warnings.push('Inserisci costi operativi, personale e marketing nelle rispettive fasi.');
  if (!answers['finanza.aliquota']) warnings.push('Indica l’aliquota fiscale ipotizzata.');
  if (costs.variable > baseRevenue && baseRevenue > 0) warnings.push('I costi variabili inseriti superano i ricavi dell’anno 1: verifica valori e periodicità.');
  if (availableSources > investments + workingCapital) warnings.push('Le fonti disponibili superano il fabbisogno iniziale stimato: verifica che non vi siano duplicazioni.');

  return {
    revenue, commercial, costs, payroll, marketing, investments, availableSources, workingCapital,
    variableRatio, contributionMarginRatio, fixedAnnual, breakEven, taxRate,
    initialFundingNeed: investments + workingCapital,
    fundingGap: Math.max(0, investments + workingCapital - availableSources),
    years, scenarios, warnings
  };
}
