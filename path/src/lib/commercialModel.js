const n = value => { const x = Number(String(value ?? '').trim().replace(',', '.')); return Number.isFinite(x) ? x : 0; };

/** Build sales from product/service unit economics. Revenue fallback remains available
 * for legacy projects that only contain annual revenue assumptions. */
export function buildCommercialModel(data = {}) {
  const a = data.answers || {};
  const products = data.lists?.prodotti || [];
  const hasUnitForecast = products.some(p => [1,2,3].some(y => n(p[`quantitaAnno${y}`]) > 0) && n(p.prezzoIpotesi) > 0);
  const years = [1,2,3].map(year => {
    const rows = products.map(p => {
      const quantity = n(p[`quantitaAnno${year}`]);
      const price = n(p.prezzoIpotesi);
      const unitCost = n(p.costoUnitario);
      return { name: p.nome || 'Prodotto/servizio', quantity, price, unitCost, revenue: quantity * price, variableCost: quantity * unitCost, contribution: quantity * (price-unitCost), capacityMonthly: n(p.capacitaMensile) };
    });
    const productRevenue = rows.reduce((s,r)=>s+r.revenue,0);
    const productVariableCost = rows.reduce((s,r)=>s+r.variableCost,0);
    const fallbackRevenue = n(a[`commerciale.ricaviAnno${year}`]);
    const fallbackVariableCost = 0;
    return { year, products: rows, productRevenue, productVariableCost, revenue: hasUnitForecast ? productRevenue : fallbackRevenue, variableCost: hasUnitForecast ? productVariableCost : fallbackVariableCost, source: hasUnitForecast ? 'unit-economics' : 'manual' };
  });
  const capacity = n(a['commerciale.capacitaVenditaMensile']);
  const startMonth = Math.max(1, Math.min(12, Math.round(n(a['commerciale.mesiAvvio']) || 1)));
  const capacityWarnings = [];
  years.forEach(y => {
    const annualUnits = y.products.reduce((s,p)=>s+p.quantity,0);
    const activeMonths = 13-startMonth;
    if (capacity > 0 && annualUnits > capacity * activeMonths) capacityWarnings.push(`Anno ${y.year}: ${annualUnits} unità previste superano la capacità commerciale indicata (${capacity * activeMonths} unità dal mese di avvio).`);
    y.products.forEach(p=>{
      const maxAnnual = p.capacityMonthly * activeMonths;
      if (p.capacityMonthly > 0 && p.quantity > maxAnnual) capacityWarnings.push(`${p.name}, anno ${y.year}: quantità previste superiori alla capacità mensile dichiarata.`);
      if (p.price > 0 && p.unitCost > p.price) capacityWarnings.push(`${p.name}: il costo variabile unitario supera il prezzo di vendita.`);
    });
  });
  const warnings = [...new Set(capacityWarnings)];
  if (hasUnitForecast && years.some(y=>y.revenue===0)) warnings.push('Il modello per prodotto/servizio è attivo, ma uno o più anni non hanno quantità previste.');
  return { years, hasUnitForecast, warnings, assumptions: { startMonth, monthlyCapacity: capacity, conversionRate: n(a['commerciale.conversioneLead']), cac: n(a['commerciale.costoAcquisizione']) } };
}
