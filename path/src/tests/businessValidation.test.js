import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBusinessPlan } from '../lib/businessValidation.js';

test('flags market hierarchy contradictions',()=>{
 const r=validateBusinessPlan({answers:{'mercato.mercatoTotale':'100','mercato.mercatoServibile':'120','mercato.mercatoOttenibile':'150'}});
 assert.ok(r.findings.some(x=>x.code==='market-sam-tam'));
 assert.ok(r.findings.some(x=>x.code==='market-som-sam'));
});
test('flags negative unit margin and capacity overload',()=>{
 const r=validateBusinessPlan({lists:{prodotti:[{nome:'Servizio A',prezzoIpotesi:'10',costoUnitario:'12',quantitaAnno1:'2000',capacitaMensile:'100'}]}});
 assert.ok(r.findings.some(x=>x.code==='unit-margin-0'));
 assert.ok(r.findings.some(x=>x.code==='capacity-0'));
});
test('flags funding gap and returns bounded score',()=>{
 const r=validateBusinessPlan({lists:{investimenti:[{importo:'10000'}]}});
 assert.ok(r.findings.some(x=>x.code==='funding-gap'));
 assert.ok(r.score>=0 && r.score<=100);
});
test('empty project reports missing evidence without throwing',()=>{
 const r=validateBusinessPlan({});
 assert.ok(r.findings.length>0);
 assert.equal(r.counts.error+r.counts.warning+r.counts.info,r.findings.length);
});
