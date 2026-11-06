import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFinancialModel } from '../lib/financialModel.js';

test('calcola EBITDA, break-even e fabbisogno con dati semplici', () => {
  const result = calculateFinancialModel({
    answers: {
      'commerciale.ricaviAnno1': '100000',
      'commerciale.ricaviAnno2': '120000',
      'commerciale.ricaviAnno3': '140000',
      'finanza.aliquota': '25',
      'finanza.ammortamenti': '5000',
      'finanza.oneri': '1000',
      'investimenti.scorte': '3000',
      'investimenti.riserva': '2000'
    },
    lists: {
      costi: [
        { tipo: 'Variabile', importo: '20000', periodicita: 'Annuale' },
        { tipo: 'Fisso', importo: '3000', periodicita: 'Mensile' }
      ],
      personale: [{ numero: '1', costo: '20000' }],
      investimenti: [{ importo: '10000' }],
      fonti: [{ importo: '8000', stato: 'Disponibile' }]
    }
  });
  assert.equal(result.years[0].ebitda, 24000);
  assert.equal(result.breakEven, 70000);
  assert.equal(result.initialFundingNeed, 15000);
  assert.equal(result.fundingGap, 7000);
  assert.equal(result.years[1].revenue, 120000);
});

test('gestisce input mancanti e avvisa sui dati insufficienti', () => {
  const result = calculateFinancialModel({});
  assert.equal(result.years.length, 3);
  assert.equal(result.years[0].revenue, 0);
  assert.ok(result.warnings.length >= 2);
  assert.equal(result.breakEven, 0);
});
