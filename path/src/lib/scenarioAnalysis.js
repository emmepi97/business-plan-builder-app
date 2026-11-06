const clamp = (v, min, max) => Math.min(max, Math.max(min, Number.isFinite(Number(v)) ? Number(v) : 0));

/** Scenario and sensitivity analysis. Values are management estimates, not statutory ratios. */
export function buildScenarioAnalysis(financial, integrated) {
  const base = financial.years[0] || {};
  const revenue = Number(base.revenue) || 0;
  const variable = Number(base.variableCosts) || 0;
  const fixed = Number(base.fixedCosts) || 0;
  const investment = Number(financial.investments) || 0;
  const taxRate = clamp(financial.taxRate ?? 0, 0, 1);
  const specs = [
    { id: 'prudente', name: 'Prudente', revenueFactor: 0.8, variableFactor: 1.1, fixedFactor: 1.05 },
    { id: 'base', name: 'Base', revenueFactor: 1, variableFactor: 1, fixedFactor: 1 },
    { id: 'favorevole', name: 'Favorevole', revenueFactor: 1.2, variableFactor: 0.98, fixedFactor: 1 }
  ];
  const scenarios = specs.map(s => {
    const sales = revenue * s.revenueFactor;
    const variableCosts = variable * s.variableFactor;
    const fixedCosts = fixed * s.fixedFactor;
    const ebitda = sales - variableCosts - fixedCosts;
    const ebit = ebitda - (Number(base.ebitda) - Number(base.ebit));
    const interest = Number(base.interest) || 0;
    const taxes = Math.max(0, ebit - interest) * taxRate;
    const netIncome = ebit - interest - taxes;
    let cash = Number(integrated?.assumptions?.openingCash) || 0;
    let minCash = cash;
    let firstNegativeMonth = null;
    (integrated?.months || []).forEach(m => {
      const net = (m.collections * s.revenueFactor) - (m.variableCosts * s.variableFactor) - (m.fixedCosts * s.fixedFactor) - (m.vatDue * s.revenueFactor) - m.capex - m.workingCapital;
      cash += net;
      minCash = Math.min(minCash, cash);
      if (cash < 0 && firstNegativeMonth === null) firstNegativeMonth = m.month;
    });
    return { ...s, revenue: sales, variableCosts, fixedCosts, ebitda, ebitdaMargin: sales ? ebitda / sales : 0, ebit, netIncome, roiProxy: investment ? netIncome / investment : null, ros: sales ? ebit / sales : 0, minCash, closingCash: cash, firstNegativeMonth };
  });
  const sensitivity = [-0.1, 0, 0.1].map(priceChange => ({
    priceChange,
    values: [-0.2, 0, 0.2].map(volumeChange => {
      const sales = revenue * (1 + priceChange) * (1 + volumeChange);
      const variableCosts = variable * (1 + volumeChange);
      const ebitda = sales - variableCosts - fixed;
      return { volumeChange, revenue: sales, ebitda };
    })
  }));
  const contribution = revenue - variable;
  const contributionRatio = revenue > 0 ? contribution / revenue : 0;
  const breakEvenRevenue = contributionRatio > 0 ? fixed / contributionRatio : null;
  const baseScenario = scenarios.find(s => s.id === 'base');
  const alerts = [];
  if (revenue <= 0) alerts.push('Inserisci una previsione di ricavi per rendere significativa l’analisi degli scenari.');
  if (investment <= 0) alerts.push('ROI non calcolabile: inserisci gli investimenti iniziali.');
  if (baseScenario?.firstNegativeMonth) alerts.push(`Nello scenario base la cassa diventa negativa al mese ${baseScenario.firstNegativeMonth}.`);
  if (contributionRatio <= 0) alerts.push('Margine di contribuzione nullo o negativo: il break-even non è raggiungibile con le ipotesi correnti.');
  return { scenarios, sensitivity, breakEvenRevenue, contributionRatio, alerts, assumptions: { taxRate } };
}

export function applyScenarioOverrides(base, overrides = {}) {
  return {
    revenueFactor: clamp(overrides.revenueFactor ?? base.revenueFactor, 0, 5),
    variableFactor: clamp(overrides.variableFactor ?? base.variableFactor, 0, 5),
    fixedFactor: clamp(overrides.fixedFactor ?? base.fixedFactor, 0, 5)
  };
}
