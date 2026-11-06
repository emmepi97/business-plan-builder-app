import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCommercialModel } from '../lib/commercialModel.js';
import { calculateFinancialModel } from '../lib/financialModel.js';

test('calculates annual product revenue, variable cost and contribution',()=>{
 const r=buildCommercialModel({lists:{prodotti:[{nome:'Servizio A',prezzoIpotesi:'100',costoUnitario:'35',quantitaAnno1:'120',quantitaAnno2:'150',quantitaAnno3:'180'}]}});
 assert.equal(r.hasUnitForecast,true);
 assert.equal(r.years[0].revenue,12000);
 assert.equal(r.years[0].variableCost,4200);
 assert.equal(r.years[0].products[0].contribution,7800);
});
test('keeps legacy annual revenue when no unit forecast exists',()=>{
 const r=buildCommercialModel({answers:{'commerciale.ricaviAnno1':'50000','commerciale.ricaviAnno2':'60000','commerciale.ricaviAnno3':'70000'},lists:{prodotti:[]}});
 assert.equal(r.hasUnitForecast,false); assert.equal(r.years[0].revenue,50000);
});
test('financial model uses product-derived revenues',()=>{
 const r=calculateFinancialModel({answers:{'finanza.aliquota':'24'},lists:{prodotti:[{prezzoIpotesi:'50',costoUnitario:'20',quantitaAnno1:'100',quantitaAnno2:'120',quantitaAnno3:'140'}]}});
 assert.equal(r.years[0].revenue,5000); assert.equal(r.years[0].variableCosts,2000);
});
test('warns when forecast exceeds monthly capacity',()=>{
 const r=buildCommercialModel({answers:{'commerciale.capacitaVenditaMensile':'10'},lists:{prodotti:[{nome:'A',prezzoIpotesi:'10',quantitaAnno1:'200',capacitaMensile:'0'}]}});
 assert.ok(r.warnings.some(w=>w.includes('capacità commerciale')));
});
