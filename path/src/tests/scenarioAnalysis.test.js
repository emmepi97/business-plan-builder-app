import test from 'node:test';
import assert from 'node:assert/strict';
import { buildScenarioAnalysis, applyScenarioOverrides } from '../lib/scenarioAnalysis.js';

test('costruisce scenari, KPI e matrice di sensibilità', () => {
  const financial = { investments: 20000, years: [{ revenue: 100000, variableCosts: 30000, fixedCosts: 40000, ebitda: 30000, ebit: 25000, interest: 1000, taxes: 6000, netIncome: 18000 }] };
  const integrated = { assumptions: { openingCash: 10000 }, months: [{ month: 1, collections: 8000, variableCosts: 2500, fixedCosts: 3000, vatDue: 1000, capex: 5000, workingCapital: 1000 }, { month: 2, collections: 8000, variableCosts: 2500, fixedCosts: 3000, vatDue: 1000, capex: 0, workingCapital: 0 }] };
  const result = buildScenarioAnalysis(financial, integrated);
  assert.equal(result.scenarios.length, 3);
  assert.equal(result.scenarios[1].revenue, 100000);
  assert.equal(result.scenarios[1].ebitda, 30000);
  assert.equal(result.sensitivity.length, 3);
  assert.equal(result.sensitivity[1].values[1].ebitda, 30000);
  assert.equal(result.contributionRatio, 0.7);
  assert.ok(Math.abs(result.breakEvenRevenue - 57142.85714285714) < 1e-8);
});

test('segnala dati insufficienti e non calcola ROI senza investimenti', () => {
  const result = buildScenarioAnalysis({ years: [{ revenue: 0 }] }, { months: [] });
  assert.equal(result.scenarios[1].roiProxy, null);
  assert.ok(result.alerts.length > 0);
});

test('applica limiti agli override', () => {
  assert.deepEqual(applyScenarioOverrides({ revenueFactor: 1, variableFactor: 1, fixedFactor: 1 }, { revenueFactor: 8, variableFactor: -1 }), { revenueFactor: 5, variableFactor: 0, fixedFactor: 1 });
});
