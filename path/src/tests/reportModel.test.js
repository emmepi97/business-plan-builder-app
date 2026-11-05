import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReportModel } from '../lib/reportModel.js';

test('report model extracts project and financial summary', () => {
  const report = buildReportModel({meta:{title:'Progetto X'},answers:{'progetto.settore':'Servizi','progetto.problema':'Problema','mercato.mercatoTotale':'1000'},lists:{prodotti:[{nome:'Servizio A'}]},quality:{a:'verificato',b:'ipotesi'}}, {years:[{revenue:120,ebitda:30,ebit:20,netIncome:15}],breakEven:80,initialFundingNeed:50,fundingGap:10}, {months:[{month:1,collections:10,netCash:2,closingCash:12}],annual:[{year:1,closingCash:12}],minCash:12,warnings:['Ipotesi']}, {scenarios:[{id:'base',name:'Base'}]}, {score:75,counts:{error:1,warning:2,info:3},findings:[{code:'X'}]});
  assert.equal(report.title,'Progetto X');
  assert.equal(report.year1.revenue,120);
  assert.equal(report.quality.verified,1);
  assert.equal(report.monthlyCash.length,1);
  assert.equal(report.validationScore,75);
});

test('report model tolerates empty project data', () => {
  const report = buildReportModel();
  assert.equal(report.title,'Il mio business plan');
  assert.equal(report.year1.revenue,0);
  assert.equal(report.findings.length,0);
});
