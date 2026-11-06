import test from 'node:test';
import assert from 'node:assert/strict';
import { buildIntegratedForecast } from '../lib/integratedFinance.js';

test('produces 36 monthly periods and three annual summaries',()=>{
 const r=buildIntegratedForecast({answers:{'commerciale.ricaviAnno1':'120000','commerciale.ricaviAnno2':'144000','commerciale.ricaviAnno3':'150000'},lists:{}});
 assert.equal(r.months.length,36); assert.equal(r.annual.length,3);
 assert.equal(r.months[0].revenue,10000); assert.equal(r.months[11].revenue,10000);
});
test('initial investment and working capital reduce opening cash',()=>{
 const r=buildIntegratedForecast({answers:{'commerciale.ricaviAnno1':'0','investimenti.scorte':'5000','investimenti.riserva':'2000'},lists:{investimenti:[{importo:'10000'}]}});
 assert.equal(r.months[0].closingCash,-17000);
});
test('VAT and collection delay are reflected in monthly cash model',()=>{
 const r=buildIntegratedForecast({answers:{'commerciale.ricaviAnno1':'120000','finanza.iva':'22','finanza.giorniIncasso':'30'},lists:{}});
 assert.equal(r.assumptions.collectionMonths,1);
 assert.equal(r.months[0].collections,0);
 assert.ok(r.months[1].collections>0);
});
