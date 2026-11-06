const n = value => {
  const parsed = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Build the factual inputs used by the printable business-plan report. */
export function buildReportModel(data = {}, financial = {}, integrated = {}, scenarios = {}, validation = {}) {
  const answers = data.answers || {};
  const products = data.lists?.prodotti || [];
  const segments = data.lists?.segmenti || [];
  const competitors = data.lists?.competitor || [];
  const year1 = financial.years?.[0] || {};
  const baseScenario = scenarios.scenarios?.find(item => item.id === 'base') || {};
  const cashMonths = integrated.months || [];
  const firstNegative = cashMonths.find(item => item.closingCash < 0);
  const filled = Object.values(answers).filter(value => value !== '' && value != null).length;
  const evidence = Object.values(data.quality || {});
  return {
    title: data.meta?.title || answers['progetto.nomeProgetto'] || 'Il mio business plan',
    sector: answers['progetto.settore'] || 'Non specificato',
    territory: answers['progetto.territorio'] || 'Non specificato',
    problem: answers['progetto.problema'] || '',
    opportunity: answers['progetto.opportunita'] || '',
    valueProposition: answers['offerta.bisogno'] || answers['offerta.benefici'] || '',
    target: segments.map(item => item.nome).filter(Boolean),
    products: products.map(item => item.nome).filter(Boolean),
    competitors: competitors.map(item => item.nome).filter(Boolean),
    market: { tam: n(answers['mercato.mercatoTotale']), sam: n(answers['mercato.mercatoServibile']), som: n(answers['mercato.mercatoOttenibile']) },
    year1: { revenue: n(year1.revenue), ebitda: n(year1.ebitda), ebit: n(year1.ebit), netIncome: n(year1.netIncome) },
    breakEven: financial.breakEven ?? null,
    fundingNeed: n(financial.initialFundingNeed),
    fundingGap: n(financial.fundingGap),
    cashMinimum: n(integrated.minCash),
    cashFinal: n(cashMonths.at(-1)?.closingCash),
    firstNegativeMonth: firstNegative?.month || null,
    baseScenario,
    validationScore: Number(validation.score) || 0,
    validationCounts: validation.counts || { error: 0, warning: 0, info: 0 },
    findings: (validation.findings || []).slice(0, 20),
    quality: { verified: evidence.filter(item => item === 'verificato').length, assumptions: evidence.filter(item => item === 'ipotesi').length, toCheck: evidence.filter(item => item === 'da-verificare').length },
    answerCount: filled,
    monthlyCash: cashMonths.slice(0, 12).map(item => ({ month: item.month, collections: item.collections, netCash: item.netCash, closingCash: item.closingCash })),
    annualCash: integrated.annual || [],
    limitations: integrated.warnings || []
  };
}
